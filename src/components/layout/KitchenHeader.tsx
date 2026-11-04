import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

interface KitchenHeaderProps {
  onOrders?: () => void;
  onLogout?: () => void;
  currentTime: Date;
}

export function KitchenHeader({ onOrders, currentTime }: KitchenHeaderProps) {
  return (
    <header className="kds-header">
      <Brand dark />
      <div className="kds-title-block">
        <span>Kitchen Display</span>
        <strong>Cola de Cocina</strong>
      </div>
      <div className="kds-header-actions">
        <div className="live-badge">
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
        <Button className="orders-shortcut" onClick={onOrders}>
          <Icon name="receipt" />
          <span>Tomar pedido</span>
        </Button>
      </div>
    </header>
  );
}
