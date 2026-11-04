import { useState } from "react";
import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import { getActiveUserName } from "../../services/auth";

interface OrderHeaderProps {
  onKitchen?: () => void;
  onLogout?: () => void;
  serverName?: string;
  serverInitials?: string;
}

export function OrderHeader({
  onKitchen,
  onLogout,
  serverName,
  serverInitials,
}: OrderHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = serverName || getActiveUserName() || "Manuel Panameño";
  const initials =
    serverInitials ||
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <header className="order-header">
      <Brand />
      <div className="header-actions">
        <div className="sync-state">
          <span className="status-dot" />
          <span>En línea</span>
        </div>

        <div className="server-profile-wrapper">
          <div
            className="server-profile"
            onClick={() => onLogout && setMenuOpen((prev) => !prev)}
            role={onLogout ? "button" : undefined}
            tabIndex={onLogout ? 0 : undefined}
            style={onLogout ? { cursor: "pointer" } : undefined}
          >
            <div className="avatar">{initials}</div>
            <div className="profile-copy">
              <span className="profile-label">Mesero</span>
              <strong>{displayName}</strong>
            </div>
            <Icon name="chevron" size={18} />
          </div>

          {menuOpen && onLogout && (
            <div className="profile-dropdown">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                <Icon name="x" size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>

        <Button className="kitchen-shortcut" onClick={onKitchen}>
          <Icon name="chef" />
          <span>Cocina</span>
        </Button>
      </div>
    </header>
  );
}
