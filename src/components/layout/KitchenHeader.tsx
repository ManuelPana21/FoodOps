import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

interface KitchenHeaderProps {
  onOrders?: () => void;
  onBilling?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
  readOnly?: boolean;
  currentTime: Date;
}

export function KitchenHeader({
  onOrders,
  onBilling,
  onAdmin,
  onLogout,
  readOnly = false,
  currentTime,
}: KitchenHeaderProps) {
  return (
    <header className="kds-header">
      <Brand dark />
      <div className="kds-title-block">
        <span>{readOnly ? "Modo Consulta · Mesero" : "Kitchen Display"}</span>
        <strong>Cola de Cocina</strong>
      </div>
      <div className="kds-header-actions">
        <div className="live-badge">
          <i />
          {readOnly ? "SOLO LECTURA" : "EN VIVO"}
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
          <Button className="orders-shortcut" onClick={onOrders}>
            <Icon name="receipt" />
            <span>Tomar pedido</span>
          </Button>
        )}
        {onBilling && (
          <Button className="orders-shortcut" onClick={onBilling}>
            <Icon name="tag" />
            <span>Facturas</span>
          </Button>
        )}
        {onAdmin && (
          <Button className="orders-shortcut" onClick={onAdmin}>
            <Icon name="edit" />
            <span>Admin</span>
          </Button>
        )}
        {onLogout && (
          <Button
            className="orders-shortcut kds-logout-shortcut"
            label="Cerrar sesión"
            onClick={onLogout}
          >
            <Icon name="x" size={18} />
            <span>Salir</span>
          </Button>
        )}
      </div>
    </header>
  );
}
