import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getActiveRole, ROLE_HOME, type Role } from "../services/auth";

/**
 * Protege una ruta según los roles permitidos en sessionStorage.
 * - Sin sesión: redirige a /login.
 * - Con un rol no autorizado: redirige a la pantalla principal de su rol.
 */
export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const role = getActiveRole();

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return <>{children}</>;
}
