import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import type { Product } from "../../types/product";
import type { CartState } from "../../types/order";
import type { Coupon, PaymentMethod } from "../../types/billing";

export interface ConfirmOrderBillingOptions {
  emitInvoice: boolean;
  customerName: string;
  customerTaxId: string;
  paymentMethod: PaymentMethod;
  manualDiscount: number;
}

interface ConfirmModalProps {
  items: Product[];
  quantities: CartState;
  subtotal: number;
  couponDiscount: number;
  appliedCoupon: Coupon | null;
  onCancel: () => void;
  onConfirm: (options: ConfirmOrderBillingOptions) => void;
}

export function ConfirmModal({
  items,
  quantities,
  subtotal,
  couponDiscount,
  appliedCoupon,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [emitInvoice, setEmitInvoice] = useState(true);
  const [customerName, setCustomerName] = useState("Consumidor Final");
  const [customerTaxId, setCustomerTaxId] = useState("CF");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [manualDiscountStr, setManualDiscountStr] = useState("0");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const manualDiscount = Math.max(
    0,
    Math.min(
      subtotal - couponDiscount,
      parseFloat(manualDiscountStr) || 0,
    ),
  );
  const finalTotal = Math.max(0, subtotal - couponDiscount - manualDiscount);

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="confirm-modal"
        role="dialog"
      >
        <div className="modal-top">
          <div className="warning-icon">
            <Icon name="warning" size={28} />
          </div>
          <div className="modal-title" id="confirm-title">
            ¿Confirmar Envío de Comanda?
          </div>
          <div className="modal-subtitle">
            Revisa el pedido antes de enviarlo. Puedes emitir e imprimir la factura al instante.
          </div>
        </div>

        <div className="modal-order">
          <div className="modal-order-label">
            <span>Resumen · Mesa 08</span>
            <span>{items.length} productos</span>
          </div>
          {items.map((item) => (
            <div className="modal-item" key={item.id}>
              <span>
                <strong>{quantities[item.id]}×</strong> {item.name}
              </span>
              <strong>${(item.price * quantities[item.id]).toFixed(2)}</strong>
            </div>
          ))}
          {couponDiscount > 0 && (
            <div className="modal-item modal-item-discount">
              <span>Cupón ({appliedCoupon?.code})</span>
              <strong>-${couponDiscount.toFixed(2)}</strong>
            </div>
          )}
          {manualDiscount > 0 && (
            <div className="modal-item modal-item-discount">
              <span>Descuento adicional</span>
              <strong>-${manualDiscount.toFixed(2)}</strong>
            </div>
          )}
          <div className="modal-total">
            <span>Total</span>
            <strong>${finalTotal.toFixed(2)}</strong>
          </div>
        </div>

        <div className="modal-billing-box">
          <label className="modal-invoice-toggle">
            <input
              type="checkbox"
              checked={emitInvoice}
              onChange={(e) => setEmitInvoice(e.target.checked)}
            />
            <span>Emitir y guardar factura electrónica/impresa</span>
          </label>

          {emitInvoice && (
            <div className="modal-billing-fields">
              <label className="login-field">
                <span>Cliente</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Consumidor Final"
                />
              </label>
              <label className="login-field">
                <span>NIT / Documento</span>
                <input
                  type="text"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  placeholder="CF"
                />
              </label>
              <label className="login-field">
                <span>Método de pago</span>
                <select
                  className="admin-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </label>
              <label className="login-field">
                <span>Descuento extra ($)</span>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={manualDiscountStr}
                  onChange={(e) => setManualDiscountStr(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <Button className="cancel-button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="confirm-button"
            onClick={() =>
              onConfirm({
                emitInvoice,
                customerName,
                customerTaxId,
                paymentMethod,
                manualDiscount,
              })
            }
          >
            <Icon name="check" />
            {emitInvoice ? "Enviar y Facturar" : "Sí, Enviar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
