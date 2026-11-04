import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getActiveRole, ROLE_HOME, type Role } from "../services/auth";

/**
 * Protege una ruta según el rol activo guardado en sessionStorage.
 * - Sin sesión: redirige a /login.
 * - Con un rol distinto al permitido: redirige a la pantalla de su rol.
 */
export default function ProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole: Role;
  children: ReactNode;
}) {
  const role = getActiveRole();

  if (!role) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to={ROLE_HOME[role]} replace />;

  return <>{children}</>;
}
