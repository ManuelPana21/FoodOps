import { useEffect, useRef, useState } from "react";
import { Brand } from "../common/Brand";
import { Button } from "../common/Button";
import { Icon } from "../common/Icon";
import { getActiveRole, getActiveUserName } from "../../services/auth";

interface OrderHeaderProps {
  onKitchen?: () => void;
  onAdmin?: () => void;
  onBilling?: () => void;
  onLogout?: () => void;
  serverName?: string;
  serverInitials?: string;
}

export function OrderHeader({
  onKitchen,
  onAdmin,
  onBilling,
  onLogout,
  serverName,
  serverInitials,
}: OrderHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeRole = getActiveRole() ?? "Mesero";
  const displayName = serverName || getActiveUserName() || "Manuel Panameño";
  const initials =
    serverInitials ||
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="order-header">
      <Brand />
      <div className="header-actions">
        <div className="sync-state">
          <span className="status-dot" />
          <span>En línea</span>
        </div>

        <div className="server-profile-wrapper" ref={menuRef}>
          <button
            type="button"
            className={`server-profile server-profile-trigger ${menuOpen ? "server-profile-open" : ""}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Menú de perfil del mesero"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="avatar">{initials}</div>
            <div className="profile-copy">
              <span className="profile-label">{activeRole}</span>
              <strong>{displayName}</strong>
            </div>
            <Icon
              name="chevron"
              size={18}
              className={`profile-chevron ${menuOpen ? "profile-chevron-open" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              {onBilling && (
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item-admin"
                  onClick={() => {
                    setMenuOpen(false);
                    onBilling();
                  }}
                >
                  <Icon name="receipt" size={16} />
                  <span>Facturas y Corte</span>
                </button>
              )}
              {onAdmin && (
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item-admin"
                  onClick={() => {
                    setMenuOpen(false);
                    onAdmin();
                  }}
                >
                  <Icon name="edit" size={16} />
                  <span>Panel Admin</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item-logout"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  <Icon name="x" size={16} />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>

        {onBilling && (
          <Button className="kitchen-shortcut" onClick={onBilling}>
            <Icon name="receipt" />
            <span>Facturas</span>
          </Button>
        )}

        {onKitchen && (
          <Button className="kitchen-shortcut" onClick={onKitchen}>
            <Icon name="chef" />
            <span>Cocina</span>
          </Button>
        )}

        {onLogout && (
          <Button
            className="logout-shortcut"
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
