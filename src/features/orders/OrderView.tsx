import { useMemo, useState } from "react";
import { OrderHeader } from "../../components/layout/OrderHeader";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import { ConfirmModal } from "../../components/feedback/ConfirmModal";
import { Toast } from "../../components/feedback/Toast";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import type { ProductCategory } from "../../types/product";
import type { CartState } from "../../types/order";
import { addTicketFromOrder, apiClient, initialProducts } from "../../services/api";
import { getActiveUserName } from "../../services/auth";

const categories: ProductCategory[] = [
  "Todos",
  "Entradas",
  "Platos Fuertes",
  "Bebidas",
  "Postres",
];

interface OrderViewProps {
  onKitchen?: () => void;
  onLogout?: () => void;
  onSendOrderSuccess?: (itemsCount: number, total: number) => void;
}

export function OrderView({
  onKitchen = () => {},
  onLogout,
  onSendOrderSuccess,
}: OrderViewProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Todos");
  const [cart, setCart] = useState<CartState>({ 1: 1, 2: 1, 5: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered =
    activeCategory === "Todos"
      ? initialProducts
      : initialProducts.filter((product) => product.category === activeCategory);
  const cartItems = initialProducts.filter((product) => cart[product.id]);
  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, product) => sum + product.price * cart[product.id],
        0,
      ),
    [cart, cartItems],
  );

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + amount);
      const updated = { ...current, [id]: next };
      if (next === 0) delete updated[id];
      return updated;
    });
    setSent(false);
  };

  const confirmSend = () => {
    const serverFull = getActiveUserName() || "Manuel Panameño";
    const serverShort = serverFull.split(" ")[0] || "Manuel";
    const formattedItems = cartItems.map(
      (item) => `${cart[item.id]}× ${item.name}`,
    );

    // Registrar en cola compartida de cocina (KDS)
    addTicketFromOrder({
      table: "Mesa 08",
      server: serverShort,
      items: formattedItems,
      note: null,
    });

    // Sincronizar con backend API si está activo
    apiClient
      .createOrder({
        tableNumber: "Mesa 08",
        serverId: 1,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: cart[item.id],
        })),
      })
      .catch(() => {
        // Fallback local ya persistido en sessionStorage
      });

    setModalOpen(false);
    setCartOpen(false);
    setSent(true);
    if (onSendOrderSuccess) {
      onSendOrderSuccess(itemCount, total);
    }
    setCart({});
  };

  return (
    <div className="order-shell">
      <OrderHeader onKitchen={onKitchen} onLogout={onLogout} />

      <main className="order-main">
        <section className="catalog">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow">Nueva comanda</span>
              <div className="page-title">¿Qué servimos hoy?</div>
            </div>
            <div className="table-chip">
              <span>Mesa</span>
              <strong>08</strong>
            </div>
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            categories={categories}
            onSelectCategory={setActiveCategory}
          />

          <ProductGrid
            products={filtered}
            onAddProduct={(product) => changeQuantity(product.id, 1)}
          />
        </section>

        <CartDrawer
          cart={cart}
          cartItems={cartItems}
          changeQuantity={changeQuantity}
          itemCount={itemCount}
          onClose={() => setCartOpen(false)}
          onSend={() => setModalOpen(true)}
          open={cartOpen}
          tableNumber="Mesa 08"
          total={total}
        />
      </main>

      <div className="mobile-cart-bar">
        <div>
          <span>{itemCount} artículos</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
        <Button className="mobile-cart-button" onClick={() => setCartOpen(true)}>
          <Icon name="receipt" />
          Ver comanda
        </Button>
      </div>

      {sent && (
        <Toast
          title="¡Pedido enviado!"
          message="La cocina ya recibió la comanda."
          onClose={() => setSent(false)}
        />
      )}

      {modalOpen && (
        <ConfirmModal
          items={cartItems}
          quantities={cart}
          total={total}
          onCancel={() => setModalOpen(false)}
          onConfirm={confirmSend}
        />
      )}
    </div>
  );
}
