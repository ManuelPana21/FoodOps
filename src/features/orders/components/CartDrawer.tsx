import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { Product } from "../../../types/product";
import type { CartState } from "../../../types/order";

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
          <div className="summary-line">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
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
            Enviar a Cocina
            <Icon name="chevron" />
          </Button>
        </div>
      </aside>
    </>
  );
}
