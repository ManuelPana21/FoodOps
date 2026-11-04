import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

interface KitchenHeaderProps {
  onOrders?: () => void;
  onLogout?: () => void;
  currentTime: Date;
}

export function KitchenHeader({ onOrders, onLogout, currentTime }: KitchenHeaderProps) {
  return (
    <header className="kds-header">
      <Brand dark />
      <div className="kds-title-block">
        <span>Kitchen Display</span>
        <strong>Cola de Cocina</strong>
      </div>
      <div className="kds-header-actions">
        <div className="live-badge" aria-label="Actualización en tiempo real activa">
          <i />
          EN VIVO
        </div>
        <div className="clock-block">
          <Icon name="clock" />
          <strong>
            {currentTime.toLocaleTimeString("es-SV", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            CST
          </strong>
        </div>

        {onOrders && (
          <Button
            className="orders-shortcut"
            label="Volver a toma de comandas"
            onClick={onOrders}
          >
            <Icon name="receipt" />
            <span>Tomar pedido</span>
          </Button>
        )}

        {onLogout && (
          <Button
            className="logout-shortcut"
            label="Cerrar sesión"
            onClick={onLogout}
          >
            <Icon name="x" />
            <span>Salir</span>
          </Button>
        )}
      </div>
    </header>
  );
}
