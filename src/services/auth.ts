/**
 * Servicio de autenticación simulada (mock) para FoodOps.
 *
 * Las credenciales están definidas en código (hardcoded) únicamente con fines
 * de demostración. El rol activo se persiste en sessionStorage, por lo que la
 * sesión se pierde al cerrar la pestaña del navegador.
 */

export type Role = "Mesero" | "Cocinero";

export interface MockUser {
  username: string;
  password: string;
  name: string;
  role: Role;
}

/** Clave de sessionStorage donde se guarda el rol activo. */
export const ROLE_STORAGE_KEY = "foodops.activeRole";
/** Clave de sessionStorage donde se guarda el nombre del usuario activo. */
export const USER_STORAGE_KEY = "foodops.activeUser";

/** Pantalla de inicio asociada a cada rol. */
export const ROLE_HOME: Record<Role, string> = {
  Mesero: "/comandas",
  Cocinero: "/cocina",
};

/** Usuarios de prueba (autenticación simulada). */
const MOCK_USERS: MockUser[] = [
  {
    username: "mesero",
    password: "mesero123",
    name: "Manuel Panameño",
    role: "Mesero",
  },
  {
    username: "cocinero",
    password: "cocina123",
    name: "Jefe de Cocina",
    role: "Cocinero",
  },
];

const isRole = (value: string | null): value is Role =>
  value === "Mesero" || value === "Cocinero";

/**
 * Valida las credenciales contra la lista hardcoded. Si son correctas,
 * guarda el rol y el nombre en sessionStorage y devuelve el usuario.
 */
export function login(username: string, password: string): MockUser | null {
  const user = MOCK_USERS.find(
    (candidate) =>
      candidate.username === username.trim().toLowerCase() &&
      candidate.password === password,
  );

  if (!user) return null;

  sessionStorage.setItem(ROLE_STORAGE_KEY, user.role);
  sessionStorage.setItem(USER_STORAGE_KEY, user.name);
  return user;
}

/** Cambia rápidamente el rol activo para navegar entre Mesero y Cocina. */
export function switchRole(role: Role): void {
  const targetUser = MOCK_USERS.find((u) => u.role === role);
  sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  if (targetUser && !sessionStorage.getItem(USER_STORAGE_KEY)) {
    sessionStorage.setItem(USER_STORAGE_KEY, targetUser.name);
  }
}

/** Elimina la sesión activa. */
export function logout(): void {
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

/** Devuelve el rol activo almacenado en sessionStorage (o null). */
export function getActiveRole(): Role | null {
  const role = sessionStorage.getItem(ROLE_STORAGE_KEY);
  return isRole(role) ? role : null;
}

/** Devuelve el nombre del usuario activo almacenado en sessionStorage. */
export function getActiveUserName(): string | null {
  return sessionStorage.getItem(USER_STORAGE_KEY);
}
