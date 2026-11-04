import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { OrderView } from "./features/orders/OrderView";
import { KitchenView } from "./features/kitchen/KitchenView";
import { getActiveRole, logout, ROLE_HOME, switchRole } from "./services/auth";

export type ActiveScreen = "orders" | "kitchen";

/** Redirige la raíz (y rutas desconocidas) según el rol activo. */
function HomeRedirect() {
  const role = getActiveRole();
  return <Navigate to={role ? ROLE_HOME[role] : "/login"} replace />;
}

export default function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleGoToKitchen = () => {
    switchRole("Cocinero");
    navigate("/cocina");
  };

  const handleGoToOrders = () => {
    switchRole("Mesero");
    navigate("/comandas");
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/comandas"
        element={
          <ProtectedRoute allowedRole="Mesero">
            <OrderView
              onKitchen={handleGoToKitchen}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cocina"
        element={
          <ProtectedRoute allowedRole="Cocinero">
            <KitchenView
              onOrders={handleGoToOrders}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
