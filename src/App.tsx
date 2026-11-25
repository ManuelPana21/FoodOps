import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { OrderView } from "./features/orders/OrderView";
import { KitchenView } from "./features/kitchen/KitchenView";
import { AdminView } from "./features/admin/AdminView";
import { BillingView } from "./features/billing/BillingView";
import { getActiveRole, logout, ROLE_HOME } from "./services/auth";

export type ActiveScreen = "orders" | "kitchen" | "admin" | "billing";

/** Redirige la raíz (y rutas desconocidas) según el rol activo. */
function HomeRedirect() {
  const role = getActiveRole();
  return <Navigate to={role ? ROLE_HOME[role] : "/login"} replace />;
}

export default function App() {
  const navigate = useNavigate();
  const activeRole = getActiveRole();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleGoToKitchen = () => navigate("/cocina");
  const handleGoToOrders = () => navigate("/comandas");
  const handleGoToAdmin = () => navigate("/admin");
  const handleGoToBilling = () => navigate("/facturacion");

  const isAdmin = activeRole === "Admin";
  const canTakeOrders = activeRole === "Mesero" || isAdmin;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/comandas"
        element={
          <ProtectedRoute allowedRoles={["Mesero", "Admin"]}>
            <OrderView
              onKitchen={handleGoToKitchen}
              onAdmin={isAdmin ? handleGoToAdmin : undefined}
              onBilling={handleGoToBilling}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cocina"
        element={
          <ProtectedRoute allowedRoles={["Cocinero", "Mesero", "Admin"]}>
            <KitchenView
              readOnly={activeRole === "Mesero"}
              onOrders={canTakeOrders ? handleGoToOrders : undefined}
              onAdmin={isAdmin ? handleGoToAdmin : undefined}
              onBilling={canTakeOrders ? handleGoToBilling : undefined}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminView
              onOrders={handleGoToOrders}
              onKitchen={handleGoToKitchen}
              onBilling={handleGoToBilling}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturacion"
        element={
          <ProtectedRoute allowedRoles={["Mesero", "Admin"]}>
            <BillingView
              isAdmin={isAdmin}
              onOrders={handleGoToOrders}
              onKitchen={handleGoToKitchen}
              onAdmin={isAdmin ? handleGoToAdmin : undefined}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
