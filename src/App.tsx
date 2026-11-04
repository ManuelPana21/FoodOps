import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { OrderView } from "./features/orders/OrderView";
import { KitchenView } from "./features/kitchen/KitchenView";
import { getActiveRole, logout, ROLE_HOME } from "./services/auth";

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

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/comandas"
        element={
          <ProtectedRoute allowedRole="Mesero">
            <OrderView
              onKitchen={() => navigate("/cocina")}
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
              onOrders={() => navigate("/comandas")}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
