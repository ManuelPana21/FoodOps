import { useState } from "react";
import { OrderView } from "./features/orders/OrderView";
import { KitchenView } from "./features/kitchen/KitchenView";

export type ActiveScreen = "orders" | "kitchen";

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>("orders");

  return screen === "orders" ? (
    <OrderView onKitchen={() => setScreen("kitchen")} />
  ) : (
    <KitchenView onOrders={() => setScreen("orders")} />
  );
}
