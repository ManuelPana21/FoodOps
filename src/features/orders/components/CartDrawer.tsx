import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { Product } from "../../../types/product";
import type { CartState } from "../../../types/order";
import { formatCurrency } from "../../../utils/formatters";

interface CartDrawerProps {
  cart: CartState;
  cartItems: Product[];
  changeQuantity: (id: number, amount: number) => void;
  itemCount: number;
  open: boolean;
  total: number;
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
  total,
  tableNumber = "Mesa 08",
  onClose,
  onSend,
}: CartDrawerProps) {
  return (
    <>
      {open && (
        <div
          className="cart-scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`cart-panel ${open ? "cart-panel-open" : ""}`}
        aria-label="Comanda actual"
      >
        <div className="cart-heading">
          <div>
            <span className="eyebrow">{tableNumber}</span>
            <div className="cart-title">Tu comanda</div>
          </div>
          <span className="item-badge">{itemCount} artículos</span>
          <Button
            className="cart-close"
            icon="x"
            label="Cerrar comanda"
            onClick={onClose}
          />
        </div>

        <div className="cart-items">
          {cartItems.length > 0 ? (
            cartItems.map((product) => {
              const qty = cart[product.id] || 0;
              const subtotal = product.price * qty;
              return (
                <div className="cart-item" key={product.id}>
                  <div className="cart-item-top">
                    <div>
                      <strong>{product.name}</strong>
                      <span>{formatCurrency(product.price)} c/u</span>
                    </div>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>

                  <div className="quantity-row">
                    <div className="stepper" role="group" aria-label={`Cantidad de ${product.name}`}>
                      <Button
                        icon="minus"
                        label={`Disminuir una unidad de ${product.name}`}
                        onClick={() => changeQuantity(product.id, -1)}
                      />
                      <strong aria-live="polite">{qty}</strong>
                      <Button
                        icon="plus"
                        label={`Aumentar una unidad de ${product.name}`}
                        onClick={() => changeQuantity(product.id, 1)}
                      />
                    </div>

                    <Button
                      className="delete-button"
                      icon="trash"
                      label={`Eliminar ${product.name} de la comanda`}
                      onClick={() => changeQuantity(product.id, -qty)}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-cart">
              <div>
                <Icon name="receipt" size={28} />
              </div>
              <strong>Tu comanda está vacía</strong>
              <span>Agrega platos del menú para comenzar el servicio.</span>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="total-line">
            <div>
              <strong>Total</strong>
              <span>Impuestos incluidos</span>
            </div>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <Button
            className="send-button"
            disabled={cartItems.length === 0}
            onClick={cartItems.length > 0 ? onSend : undefined}
          >
            <Icon name="spark" />
            <span>Enviar a Cocina</span>
            <Icon name="chevron" />
          </Button>
        </div>
      </aside>
    </>
  );
}
