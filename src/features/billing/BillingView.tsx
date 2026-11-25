import { useMemo, useState, type FormEvent } from "react";
import { Brand } from "../../components/common/Brand";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import { Toast } from "../../components/feedback/Toast";
import { InvoicePrintModal } from "../../components/billing/InvoicePrintModal";
import type { Coupon, CouponType, Invoice } from "../../types/billing";
import {
  addCoupon,
  computeDailySummary,
  deleteCoupon,
  getAllDailySummaries,
  getLocalDateKey,
  loadCoupons,
  loadInvoices,
  refundInvoice,
  toggleCoupon,
} from "../../services/billing";

interface BillingViewProps {
  isAdmin?: boolean;
  onOrders?: () => void;
  onKitchen?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

type BillingTab = "invoices" | "coupons" | "daily";

export function BillingView({
  isAdmin = true,
  onOrders,
  onKitchen,
  onAdmin,
  onLogout,
}: BillingViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadCoupons());
  const [activeTab, setActiveTab] = useState<BillingTab>("invoices");
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateKey());
  const [showAllDates, setShowAllDates] = useState(false);
  const [search, setSearch] = useState("");
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Refund modal state
  const [refundTarget, setRefundTarget] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // Coupon form state
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );

  const daySummary = useMemo(
    () => computeDailySummary(invoices, selectedDate),
    [invoices, selectedDate],
  );

  const dailyHistory = useMemo(
    () => getAllDailySummaries(invoices),
    [invoices],
  );

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesDate = showAllDates || inv.dateKey === selectedDate;
      const matchesQuery =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.tableNumber.toLowerCase().includes(q) ||
        (inv.couponCode ?? "").toLowerCase().includes(q);
      return matchesDate && matchesQuery;
    });
  }, [invoices, selectedDate, showAllDates, search]);

  const handleConfirmRefund = (event: FormEvent) => {
    event.preventDefault();
    if (!refundTarget) return;
    const updated = refundInvoice(refundTarget.id, refundReason);
    setInvoices(updated);
    setToast({
      title: "Devolución registrada",
      message: `La factura ${refundTarget.invoiceNumber} fue marcada como devuelta.`,
    });
    setRefundTarget(null);
    setRefundReason("");
  };

  const handleCreateCoupon = (event: FormEvent) => {
    event.preventDefault();
    const parsedVal = parseFloat(couponValue);
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón.");
      return;
    }
    if (isNaN(parsedVal) || parsedVal <= 0) {
      setCouponError("Ingresa un valor de descuento mayor a 0.");
      return;
    }
    if (couponType === "percent" && parsedVal > 100) {
      setCouponError("El porcentaje no puede ser mayor a 100%.");
      return;
    }

    try {
      const updated = addCoupon({
        code: couponCode.trim().toUpperCase(),
        type: couponType,
        value: parsedVal,
        description:
          couponDesc.trim() ||
          (couponType === "percent"
            ? `${parsedVal}% de descuento`
            : `$${parsedVal.toFixed(2)} de descuento`),
        active: true,
      });
      setCoupons(updated);
      setCouponCode("");
      setCouponValue("");
      setCouponDesc("");
      setCouponError(null);
      setToast({
        title: "Cupón creado",
        message: "El cupón ya puede aplicarse en las comandas.",
      });
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Error al crear cupón.");
    }
  };

  return (
    <div className="order-shell">
      <header className="order-header">
        <Brand />
        <div className="header-actions">
          <div className="sync-state">
            <span className="status-dot" />
            <span>Caja y Facturación</span>
          </div>

          {onOrders && (
            <Button className="kitchen-shortcut" onClick={onOrders}>
              <Icon name="receipt" />
              <span>Comandas</span>
            </Button>
          )}

          {onKitchen && (
            <Button className="kitchen-shortcut" onClick={onKitchen}>
              <Icon name="chef" />
              <span>Cocina</span>
            </Button>
          )}

          {onAdmin && (
            <Button className="kitchen-shortcut" onClick={onAdmin}>
              <Icon name="edit" />
              <span>Menú</span>
            </Button>
          )}

          {onLogout && (
            <Button className="logout-shortcut" onClick={onLogout}>
              <Icon name="x" size={18} />
              <span>Salir</span>
            </Button>
          )}
        </div>
      </header>

      <main className="admin-main">
        <section className="catalog">
          <div className="admin-top-bar">
            <div>
              <span className="eyebrow">Registro diario · Facturas, cupones y devoluciones</span>
              <div className="page-title">Facturación y Corte Diario</div>
            </div>

            <div className="billing-date-controls">
              <label className="billing-date-picker">
                <span>Fecha de corte</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setShowAllDates(false);
                  }}
                />
              </label>
              <Button
                className={`category-pill ${showAllDates ? "category-active" : ""}`}
                onClick={() => setShowAllDates((prev) => !prev)}
              >
                {showAllDates ? "Viendo todas" : "Ver todas"}
              </Button>
            </div>
          </div>

          {/* Tarjetas de resumen del día seleccionado */}
          <div className="billing-kpi-grid">
            <article className="billing-kpi-card billing-kpi-primary">
              <span>Ventas Netas ({selectedDate})</span>
              <strong>${daySummary.netSales.toFixed(2)}</strong>
              <small>{daySummary.paidCount} facturas cobradas</small>
            </article>
            <article className="billing-kpi-card">
              <span>Ventas Brutas</span>
              <strong>${daySummary.grossSales.toFixed(2)}</strong>
              <small>{daySummary.invoiceCount} comprobantes emitidos</small>
            </article>
            <article className="billing-kpi-card billing-kpi-amber">
              <span>Descuentos y Cupones</span>
              <strong>-${daySummary.totalDiscounts.toFixed(2)}</strong>
              <small>Aplicados en caja</small>
            </article>
            <article className="billing-kpi-card billing-kpi-danger">
              <span>Devoluciones</span>
              <strong>-${daySummary.totalRefunds.toFixed(2)}</strong>
              <small>{daySummary.refundCount} facturas anuladas</small>
            </article>
          </div>

          {/* Navegación por pestañas */}
          <div className="admin-filters-bar">
            <div className="category-row" role="tablist">
              <Button
                className={`category-pill ${activeTab === "invoices" ? "category-active" : ""}`}
                onClick={() => setActiveTab("invoices")}
              >
                <Icon name="receipt" size={17} />
                <span>Facturas ({filteredInvoices.length})</span>
              </Button>
              <Button
                className={`category-pill ${activeTab === "coupons" ? "category-active" : ""}`}
                onClick={() => setActiveTab("coupons")}
              >
                <Icon name="tag" size={17} />
                <span>Cupones ({coupons.length})</span>
              </Button>
              <Button
                className={`category-pill ${activeTab === "daily" ? "category-active" : ""}`}
                onClick={() => setActiveTab("daily")}
              >
                <Icon name="clock" size={17} />
                <span>Historial por Día ({dailyHistory.length})</span>
              </Button>
            </div>

            {activeTab === "invoices" && (
              <div className="admin-search-box">
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Buscar factura, cliente o cupón..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setSearch("")}
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: Facturas */}
          {activeTab === "invoices" && (
            <div className="billing-panel">
              {filteredInvoices.length > 0 ? (
                <div className="billing-table-wrap">
                  <table className="billing-table">
                    <thead>
                      <tr>
                        <th>Factura</th>
                        <th>Fecha / Hora</th>
                        <th>Cliente</th>
                        <th>Mesa / Pago</th>
                        <th>Descuento</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            <strong>{inv.invoiceNumber}</strong>
                            <small className="block text-xs text-gray-500">
                              {inv.items.length} productos
                            </small>
                          </td>
                          <td>
                            {new Date(inv.createdAt).toLocaleString("es-SV", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>
                            <strong>{inv.customerName}</strong>
                            <small className="block text-xs text-gray-500">
                              {inv.customerTaxId}
                            </small>
                          </td>
                          <td>
                            <span>{inv.tableNumber}</span>
                            <small className="block text-xs text-gray-500">
                              {inv.paymentMethod}
                            </small>
                          </td>
                          <td>
                            {inv.discountTotal > 0 ? (
                              <span className="billing-discount-pill">
                                -${inv.discountTotal.toFixed(2)}
                                {inv.couponCode ? ` (${inv.couponCode})` : ""}
                              </span>
                            ) : (
                              <span className="text-gray-400">$0.00</span>
                            )}
                          </td>
                          <td>
                            <strong>${inv.total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span
                              className={`billing-status-pill ${
                                inv.status === "paid"
                                  ? "billing-status-paid"
                                  : "billing-status-refunded"
                              }`}
                            >
                              {inv.status === "paid" ? "COBRADA" : "DEVUELTA"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-card-actions">
                              <Button
                                className="admin-edit-btn"
                                onClick={() => setPreviewInvoice(inv)}
                              >
                                <Icon name="printer" size={16} />
                                <span>Imprimir</span>
                              </Button>
                              {inv.status === "paid" && (
                                <Button
                                  className="admin-delete-btn"
                                  label={`Devolver ${inv.invoiceNumber}`}
                                  onClick={() => {
                                    setRefundTarget(inv);
                                    setRefundReason("");
                                  }}
                                >
                                  <Icon name="warning" size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <div>
                    <Icon name="receipt" size={28} />
                  </div>
                  <strong>Sin facturas en esta fecha</strong>
                  <span>
                    Emite una comanda desde la vista de Mesero o selecciona otro día.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Cupones */}
          {activeTab === "coupons" && (
            <div className={isAdmin ? "billing-coupons-layout" : ""}>
              {isAdmin && (
                <form className="billing-panel billing-coupon-form" onSubmit={handleCreateCoupon}>
                <h3>Crear Nuevo Cupón</h3>
                <label className="login-field">
                  <span>Código (ej. DESCUENTO15)</span>
                  <input
                    type="text"
                    placeholder="FOOD15"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                  />
                </label>

                <div className="admin-form-row">
                  <label className="login-field">
                    <span>Tipo</span>
                    <select
                      className="admin-select"
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as CouponType)}
                    >
                      <option value="percent">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo ($)</option>
                    </select>
                  </label>
                  <label className="login-field">
                    <span>Valor</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder={couponType === "percent" ? "15" : "5.00"}
                      value={couponValue}
                      onChange={(e) => {
                        setCouponValue(e.target.value);
                        setCouponError(null);
                      }}
                    />
                  </label>
                </div>

                <label className="login-field">
                  <span>Descripción</span>
                  <input
                    type="text"
                    placeholder="Ej. Promoción fin de semana"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                  />
                </label>

                {couponError && <div className="login-error">{couponError}</div>}

                <Button className="admin-add-button" type="submit">
                  <Icon name="plus" />
                  <span>Guardar Cupón</span>
                </Button>
              </form>
              )}

              <div className="billing-panel billing-coupons-list">
                <h3>Cupones Registrados</h3>
                <div className="coupons-grid">
                  {coupons.map((coupon) => (
                    <article
                      key={coupon.id}
                      className={`coupon-card ${!coupon.active ? "coupon-inactive" : ""}`}
                    >
                      <div className="coupon-card-top">
                        <span className="coupon-code-badge">{coupon.code}</span>
                        <strong>
                          {coupon.type === "percent"
                            ? `${coupon.value}% OFF`
                            : `-$${coupon.value.toFixed(2)}`}
                        </strong>
                      </div>
                      <p>{coupon.description}</p>
                      {isAdmin && (
                        <div className="coupon-card-actions">
                          <Button
                            className="admin-edit-btn"
                            onClick={() => setCoupons(toggleCoupon(coupon.id))}
                          >
                            {coupon.active ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            className="admin-delete-btn"
                            label={`Eliminar cupón ${coupon.code}`}
                            onClick={() => setCoupons(deleteCoupon(coupon.id))}
                          >
                            <Icon name="trash" size={16} />
                          </Button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Historial por Día */}
          {activeTab === "daily" && (
            <div className="billing-panel">
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Facturas</th>
                      <th>Devoluciones</th>
                      <th>Ventas Brutas</th>
                      <th>Descuentos</th>
                      <th>Monto Devuelto</th>
                      <th>Venta Neta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyHistory.map((day) => (
                      <tr key={day.dateKey}>
                        <td>
                          <strong>{day.dateKey}</strong>
                        </td>
                        <td>{day.invoiceCount}</td>
                        <td>{day.refundCount}</td>
                        <td>${day.grossSales.toFixed(2)}</td>
                        <td className="text-amber-700">
                          -${day.totalDiscounts.toFixed(2)}
                        </td>
                        <td className="text-red-600">
                          -${day.totalRefunds.toFixed(2)}
                        </td>
                        <td>
                          <strong>${day.netSales.toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {previewInvoice && (
        <InvoicePrintModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {refundTarget && (
        <div className="modal-backdrop" role="presentation">
          <div className="confirm-modal admin-modal" role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">Anulación y Devolución</span>
                <div className="modal-title">
                  Devolver {refundTarget.invoiceNumber}
                </div>
              </div>
              <Button
                className="delete-button"
                icon="x"
                label="Cerrar"
                onClick={() => setRefundTarget(null)}
              />
            </div>

            <form className="admin-form" onSubmit={handleConfirmRefund}>
              <p className="text-sm text-gray-600">
                Se registrará una devolución por{" "}
                <strong>${refundTarget.total.toFixed(2)}</strong> y se
                descontará de las ventas netas del día{" "}
                <strong>{refundTarget.dateKey}</strong>.
              </p>
              <label className="login-field">
                <span>Motivo de la devolución</span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ej. Pedido equivocado / Solicitud del cliente"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </label>

              <div className="modal-actions admin-modal-actions">
                <Button
                  className="cancel-button"
                  onClick={() => setRefundTarget(null)}
                >
                  Cancelar
                </Button>
                <Button className="confirm-button refund-confirm-btn" type="submit">
                  <Icon name="check" />
                  <span>Confirmar Devolución</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
