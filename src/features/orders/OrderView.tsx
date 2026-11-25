import { useEffect, useMemo, useState } from "react";
import { OrderHeader } from "../../components/layout/OrderHeader";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import {
  ConfirmModal,
  type ConfirmOrderBillingOptions,
} from "../../components/feedback/ConfirmModal";
import { Toast } from "../../components/feedback/Toast";
import { InvoicePrintModal } from "../../components/billing/InvoicePrintModal";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import type { Product, ProductCategory } from "../../types/product";
import type { CartState } from "../../types/order";
import type { Coupon, Invoice } from "../../types/billing";
import { addTicketFromOrder, apiClient, loadStoredProducts } from "../../services/api";
import { calculateCouponDiscount, emitInvoice } from "../../services/billing";
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
  onAdmin?: () => void;
  onBilling?: () => void;
  onLogout?: () => void;
  onSendOrderSuccess?: (itemsCount: number, total: number) => void;
}

export function OrderView({
  onKitchen = () => {},
  onAdmin,
  onBilling,
  onLogout,
  onSendOrderSuccess,
}: OrderViewProps) {
  const [products, setProducts] = useState<Product[]>(() => loadStoredProducts());
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Todos");
  const [cart, setCart] = useState<CartState>({ 1: 1, 2: 1, 5: 1 });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [issuedInvoice, setIssuedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setProducts(loadStoredProducts());
    const onStorage = () => setProducts(loadStoredProducts());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered =
    activeCategory === "Todos"
      ? products
      : products.filter((product) => product.category === activeCategory);
  const cartItems = products.filter((product) => cart[product.id]);
  const itemCount = cartItems.reduce((sum, p) => sum + (cart[p.id] ?? 0), 0);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, product) => sum + product.price * cart[product.id],
        0,
      ),
    [cart, cartItems],
  );

  const couponDiscount = useMemo(
    () => calculateCouponDiscount(appliedCoupon, subtotal),
    [appliedCoupon, subtotal],
  );

  const total = Math.max(0, Math.round((subtotal - couponDiscount) * 100) / 100);

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + amount);
      const updated = { ...current, [id]: next };
      if (next === 0) delete updated[id];
      return updated;
    });
    setSent(false);
  };

  const confirmSend = (billingOpts: ConfirmOrderBillingOptions) => {
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
      note: appliedCoupon ? `Cupón aplicado: ${appliedCoupon.code}` : null,
    });

    // Emitir y almacenar factura si está habilitado
    if (billingOpts.emitInvoice) {
      const invoice = emitInvoice({
        tableNumber: "Mesa 08",
        serverName: serverFull,
        customerName: billingOpts.customerName,
        customerTaxId: billingOpts.customerTaxId,
        paymentMethod: billingOpts.paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: cart[item.id],
          unitPrice: item.price,
          subtotal: Math.round(item.price * cart[item.id] * 100) / 100,
        })),
        couponCode: appliedCoupon?.code ?? null,
        couponDiscount,
        manualDiscount: billingOpts.manualDiscount,
      });
      setIssuedInvoice(invoice);
    }

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
      onSendOrderSuccess(
        itemCount,
        Math.max(0, total - billingOpts.manualDiscount),
      );
    }
    setCart({});
    setAppliedCoupon(null);
  };

  return (
    <div className="order-shell">
      <OrderHeader
        onKitchen={onKitchen}
        onAdmin={onAdmin}
        onBilling={onBilling}
        onLogout={onLogout}
      />

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
          subtotal={subtotal}
          discountAmount={couponDiscount}
          total={total}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={setAppliedCoupon}
          tableNumber="Mesa 08"
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
          message="La cocina recibió la comanda y la factura fue registrada."
          onClose={() => setSent(false)}
        />
      )}

      {modalOpen && (
        <ConfirmModal
          items={cartItems}
          quantities={cart}
          subtotal={subtotal}
          couponDiscount={couponDiscount}
          appliedCoupon={appliedCoupon}
          onCancel={() => setModalOpen(false)}
          onConfirm={confirmSend}
        />
      )}

      {issuedInvoice && (
        <InvoicePrintModal
          invoice={issuedInvoice}
          onClose={() => setIssuedInvoice(null)}
        />
      )}
    </div>
  );
}
