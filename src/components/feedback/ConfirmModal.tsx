import { useEffect } from "react";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import type { Product } from "../../types/product";
import type { CartState } from "../../types/order";

interface ConfirmModalProps {
  items: Product[];
  quantities: CartState;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  items,
  quantities,
  total,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

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
            Revisa el pedido antes de enviarlo. Una vez confirmado, aparecerá
            inmediatamente en cocina.
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
          <div className="modal-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <Button className="cancel-button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="confirm-button" onClick={onConfirm}>
            <Icon name="check" />
            Sí, Enviar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
