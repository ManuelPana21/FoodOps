import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

interface OrderHeaderProps {
  onKitchen: () => void;
  serverName?: string;
  serverInitials?: string;
}

export function OrderHeader({
  onKitchen,
  serverName = "Manuel Panameño",
  serverInitials = "MP",
}: OrderHeaderProps) {
  return (
    <header className="order-header">
      <Brand />
      <div className="header-actions">
        <div className="sync-state">
          <span className="status-dot" />
          <span>En línea</span>
        </div>

        <div className="server-profile" aria-label={`Sesión activa de ${serverName}`}>
          <div className="avatar">{serverInitials}</div>
          <div className="profile-copy">
            <span className="profile-label">Mesero</span>
            <strong>{serverName}</strong>
          </div>
          <Icon name="chevron" size={18} />
        </div>

        <Button
          className="kitchen-shortcut"
          label="Ir a pantalla de cocina"
          onClick={onKitchen}
        >
          <Icon name="chef" />
          <span>Cocina</span>
        </Button>
      </div>
    </header>
  );
}
