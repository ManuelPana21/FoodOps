import { useState } from "react";
import { OrderView } from "./features/orders/OrderView";
import { KitchenView } from "./features/kitchen/KitchenView";

export type ActiveScreen = "orders" | "kitchen";

/** Redirige la raíz (y rutas desconocidas) según el rol activo. */
function HomeRedirect() {
  const role = getActiveRole();
  return <Navigate to={role ? ROLE_HOME[role] : "/login"} replace />;
}

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>("orders");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/comandas"
        element={
          <ProtectedRoute allowedRole="Mesero">
            <OrderView onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cocina"
        element={
          <ProtectedRoute allowedRole="Cocinero">
            <KitchenView onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
