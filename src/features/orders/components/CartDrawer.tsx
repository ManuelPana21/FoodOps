import { useState } from "react";
import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { Product } from "../../../types/product";
import type { CartState } from "../../../types/order";
import type { Coupon } from "../../../types/billing";
import { findActiveCoupon } from "../../../services/billing";

interface CartDrawerProps {
  cart: CartState;
  cartItems: Product[];
  changeQuantity: (id: number, amount: number) => void;
  itemCount: number;
  open: boolean;
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  tableNumber?: string;
  onClose: () => void;
  onSend: () => void;
}

export function CartDrawer({
  cart,
  cartItems,
  changeQuantity,
  itemCount,
  open,
  subtotal,
  discountAmount,
  total,
  appliedCoupon,
  onApplyCoupon,
  tableNumber = "Mesa 08",
  onClose,
  onSend,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    const found = findActiveCoupon(couponInput);
    if (!found) {
      setCouponError("Cupón no válido o inactivo.");
      return;
    }
    onApplyCoupon(found);
    setCouponInput("");
    setCouponError(null);
  };

  return (
    <>
      {open && <div className="cart-scrim" onClick={onClose} />}
      <aside className={`cart-panel ${open ? "cart-panel-open" : ""}`}>
        <div className="cart-heading">
          <div>
            <span className="eyebrow">{tableNumber}</span>
            <div className="cart-title">Tu comanda</div>
          </div>
          <span className="item-badge">{itemCount} artículos</span>
          <Button className="cart-close" icon="x" label="Cerrar" onClick={onClose} />
        </div>

        <div className="cart-items">
          {cartItems.length ? (
            cartItems.map((product) => (
              <div className="cart-item" key={product.id}>
                <div className="cart-item-top">
                  <div>
                    <strong>{product.name}</strong>
                    <span>${product.price.toFixed(2)} c/u</span>
                  </div>
                  <strong>
                    ${(product.price * cart[product.id]).toFixed(2)}
                  </strong>
                </div>
                <div className="quantity-row">
                  <div className="stepper">
                    <Button
                      icon="minus"
                      label={`Quitar ${product.name}`}
                      onClick={() => changeQuantity(product.id, -1)}
                    />
                    <strong>{cart[product.id]}</strong>
                    <Button
                      icon="plus"
                      label={`Agregar ${product.name}`}
                      onClick={() => changeQuantity(product.id, 1)}
                    />
                  </div>
                  <Button
                    className="delete-button"
                    icon="trash"
                    label={`Eliminar ${product.name}`}
                    onClick={() => changeQuantity(product.id, -cart[product.id])}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <div>
                <Icon name="receipt" size={28} />
              </div>
              <strong>Tu comanda está vacía</strong>
              <span>Agrega platos del menú para comenzar.</span>
            </div>
          )}
        </div>

        <div className="cart-summary">
          {cartItems.length > 0 && (
            <div className="cart-coupon-box">
              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <span>
                    <Icon name="tag" size={14} /> Cupón{" "}
                    <strong>{appliedCoupon.code}</strong> (
                    {appliedCoupon.type === "percent"
                      ? `-${appliedCoupon.value}%`
                      : `-$${appliedCoupon.value.toFixed(2)}`}
                    )
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar cupón"
                    onClick={() => onApplyCoupon(null)}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    placeholder="Cupón (ej. FOOD10)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="coupon-apply-btn"
                    onClick={handleApplyCoupon}
                  >
                    Aplicar
                  </button>
                </div>
              )}
              {couponError && (
                <div className="coupon-error-text">{couponError}</div>
              )}
            </div>
          )}

          <div className="summary-line">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-line summary-discount">
              <span>Descuento aplicado</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="total-line">
            <div>
              <strong>Total</strong>
              <span>Impuestos incluidos</span>
            </div>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <Button
            className="send-button"
            onClick={cartItems.length ? onSend : undefined}
          >
            <Icon name="spark" />
            Enviar a Cocina y Facturar
            <Icon name="chevron" />
          </Button>
        </div>
      </aside>
    </>
  );
}
