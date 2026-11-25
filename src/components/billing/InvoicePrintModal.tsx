import { useEffect } from "react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import type { Invoice } from "../../types/billing";

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoicePrintModal({ invoice, onClose }: InvoicePrintModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const formattedDate = new Date(invoice.createdAt).toLocaleString("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop print-modal-backdrop" role="presentation">
      <div
        aria-labelledby="invoice-print-title"
        aria-modal="true"
        className="confirm-modal invoice-print-modal"
        role="dialog"
      >
        <div className="invoice-modal-toolbar no-print">
          <div className="invoice-toolbar-title">
            <Icon name="receipt" size={18} />
            <span id="invoice-print-title">Comprobante de Factura</span>
          </div>
          <Button
            className="delete-button"
            icon="x"
            label="Cerrar vista previa"
            onClick={onClose}
          />
        </div>

        <div className="invoice-sheet" id="printable-invoice">
          <div className="invoice-sheet-header">
            <div className="invoice-brand-title">FoodOps</div>
            <div className="invoice-brand-sub">
              Restaurante &amp; Cocina · Comprobante de Venta
            </div>
            <div className="invoice-number-badge">{invoice.invoiceNumber}</div>
            {invoice.status === "refunded" && (
              <div className="invoice-refunded-stamp">
                ANULADA / DEVOLUCIÓN
              </div>
            )}
          </div>

          <div className="invoice-meta-grid">
            <div>
              <span>Fecha</span>
              <strong>{formattedDate}</strong>
            </div>
            <div>
              <span>Mesa / Origen</span>
              <strong>{invoice.tableNumber}</strong>
            </div>
            <div>
              <span>Cliente</span>
              <strong>{invoice.customerName}</strong>
            </div>
            <div>
              <span>NIT / Documento</span>
              <strong>{invoice.customerTaxId}</strong>
            </div>
            <div>
              <span>Atendió</span>
              <strong>{invoice.serverName}</strong>
            </div>
            <div>
              <span>Método de Pago</span>
              <strong>{invoice.paymentMethod}</strong>
            </div>
          </div>

          <div className="invoice-items-table">
            <div className="invoice-items-head">
              <span>Cant. / Descripción</span>
              <span>Importe</span>
            </div>
            {invoice.items.map((item, idx) => (
              <div className="invoice-item-row" key={`${item.productId}-${idx}`}>
                <div>
                  <strong>{item.quantity}×</strong> {item.name}
                  <small> (${item.unitPrice.toFixed(2)} c/u)</small>
                </div>
                <strong>${item.subtotal.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="invoice-totals-box">
            <div className="invoice-total-line">
              <span>Subtotal</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.couponDiscount > 0 && (
              <div className="invoice-total-line invoice-discount-line">
                <span>Cupón ({invoice.couponCode})</span>
                <span>-${invoice.couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {invoice.manualDiscount > 0 && (
              <div className="invoice-total-line invoice-discount-line">
                <span>Descuento adicional</span>
                <span>-${invoice.manualDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="invoice-grand-total">
              <span>TOTAL</span>
              <strong>${invoice.total.toFixed(2)}</strong>
            </div>
          </div>

          {invoice.status === "refunded" && invoice.refundReason && (
            <div className="invoice-refund-note">
              <strong>Motivo de devolución:</strong> {invoice.refundReason}
            </div>
          )}

          <div className="invoice-sheet-footer">
            <span>Impuestos incluidos · ¡Gracias por su preferencia!</span>
          </div>
        </div>

        <div className="modal-actions no-print">
          <Button className="cancel-button" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="confirm-button invoice-print-btn" onClick={handlePrint}>
            <Icon name="printer" />
            <span>Imprimir Factura</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
