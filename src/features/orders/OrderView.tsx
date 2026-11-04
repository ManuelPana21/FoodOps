import { useMemo, useState } from "react";
import { OrderHeader } from "../../components/layout/OrderHeader";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import { ConfirmModal } from "../../components/feedback/ConfirmModal";
import { Toast } from "../../components/feedback/Toast";
import { Button } from "../../components/common/Button";
import type { Product, ProductCategory } from "../../types/product";
import type { CartState } from "../../types/order";
import { formatCurrency } from "../../utils/formatters";

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    description: "Carne, queso, lechuga y salsa de la casa",
    price: 6.5,
    category: "Platos Fuertes",
    image:
      "https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 2,
    name: "Tacos al Pastor",
    description: "Tres tacos, piña, cilantro y cebolla",
    price: 5.0,
    category: "Platos Fuertes",
    image:
      "https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 3,
    name: "Pasta Cremosa",
    description: "Pasta fresca, parmesano y hierbas",
    price: 7.5,
    category: "Platos Fuertes",
    image:
      "https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 4,
    name: "Alitas BBQ",
    description: "Seis alitas con salsa BBQ ahumada",
    price: 5.75,
    category: "Entradas",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 5,
    name: "Soda",
    description: "Coca-Cola, Sprite o Fanta · 355 ml",
    price: 1.5,
    category: "Bebidas",
    image: null,
  },
  {
    id: 6,
    name: "Brownie Tibio",
    description: "Chocolate oscuro y helado de vainilla",
    price: 3.5,
    category: "Postres",
    image:
      "https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85",
  },
];

const categories: ProductCategory[] = [
  "Todos",
  "Entradas",
  "Platos Fuertes",
  "Bebidas",
  "Postres",
];

interface OrderViewProps {
  onKitchen: () => void;
  onSendOrderSuccess?: (itemsCount: number, total: number) => void;
}

export function OrderView({ onKitchen, onSendOrderSuccess }: OrderViewProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Todos");
  const [cart, setCart] = useState<CartState>({ 1: 1, 2: 1, 5: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return initialProducts;
    return initialProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartItems = useMemo(
    () => initialProducts.filter((product) => (cart[product.id] ?? 0) > 0),
    [cart],
  );

  const itemCount = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart],
  );

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, product) => sum + product.price * (cart[product.id] ?? 0),
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
      <OrderHeader onKitchen={onKitchen} />

      <main className="order-main">
        <section className="catalog" aria-label="Catálogo de productos">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow">Nueva comanda</span>
              <div className="page-title">¿Qué servimos hoy?</div>
            </div>
            <div className="table-chip" aria-label="Mesa 08 seleccionada">
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
            products={filteredProducts}
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

      <div className="mobile-cart-bar" role="region" aria-label="Resumen móvil de comanda">
        <div>
          <span>{itemCount} artículos</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <Button
          className="mobile-cart-button"
          icon="receipt"
          label="Abrir comanda"
          onClick={() => setCartOpen(true)}
        >
          Ver comanda
        </Button>
      </div>

      {sent && (
        <Toast
          title="¡Pedido enviado con éxito!"
          message="La comanda fue registrada y transmitida a la cola de preparación en cocina."
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
