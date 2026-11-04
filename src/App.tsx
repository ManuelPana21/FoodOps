import { useEffect, useMemo, useState, type ReactNode } from "react";

type IconName =
  | "chef"
  | "check"
  | "chevron"
  | "clock"
  | "minus"
  | "plus"
  | "receipt"
  | "search"
  | "spark"
  | "trash"
  | "warning"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    chef: (
      <>
        <path d="M6.5 10.5c-2.8 0-3.5-4.2-.6-5.1A4.1 4.1 0 0 1 13 3.8a3.6 3.6 0 0 1 5.5 3c0 2-1.4 3.5-3.4 3.7" />
        <path d="M6.5 10v9h9v-9M6.5 15h9" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    minus: <path d="M6 12h12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="m5.6 5.6 2 2m8.8 8.8 2 2m0-12.8-2 2M7.6 16.4l-2 2" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    warning: (
      <>
        <path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className = "",
  icon,
  label,
  onClick,
  type = "button",
}: {
  children?: ReactNode;
  className?: string;
  icon?: IconName;
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      aria-label={label}
      className={`button-base ${className}`}
      onClick={onClick}
      type={type}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

const foodPhotos = {
  burger:
    "https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85",
  tacos:
    "https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85",
  pasta:
    "https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85",
  wings:
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85",
  brownie:
    "https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85",
};

const products = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    description: "Carne, queso, lechuga y salsa de la casa",
    price: 6.5,
    category: "Platos Fuertes",
    image: foodPhotos.burger,
  },
  {
    id: 2,
    name: "Tacos al Pastor",
    description: "Tres tacos, piña, cilantro y cebolla",
    price: 5,
    category: "Platos Fuertes",
    image: foodPhotos.tacos,
  },
  {
    id: 3,
    name: "Pasta Cremosa",
    description: "Pasta fresca, parmesano y hierbas",
    price: 7.5,
    category: "Platos Fuertes",
    image: foodPhotos.pasta,
  },
  {
    id: 4,
    name: "Alitas BBQ",
    description: "Seis alitas con salsa BBQ ahumada",
    price: 5.75,
    category: "Entradas",
    image: foodPhotos.wings,
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
    image: foodPhotos.brownie,
  },
];

type Product = (typeof products)[number];
type Cart = Record<number, number>;

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="brand">
      <div className={`brand-mark ${dark ? "brand-mark-dark" : ""}`}>
        <Icon name="chef" size={24} />
      </div>
      <div className={`brand-name ${dark ? "text-white" : ""}`}>
        Food<span>Ops</span>
      </div>
    </div>
  );
}

function OrderView({ onKitchen }: { onKitchen: () => void }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState<Cart>({ 1: 1, 2: 1, 5: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const categories = ["Todos", "Entradas", "Platos Fuertes", "Bebidas", "Postres"];

  const filtered =
    activeCategory === "Todos"
      ? products
      : products.filter((product) => product.category === activeCategory);
  const cartItems = products.filter((product) => cart[product.id]);
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
    setModalOpen(false);
    setCartOpen(false);
    setSent(true);
    setCart({});
  };

  return (
    <div className="order-shell">
      <header className="order-header">
        <Brand />
        <div className="header-actions">
          <div className="sync-state">
            <span className="status-dot" />
            <span>En línea</span>
          </div>
          <div className="server-profile">
            <div className="avatar">MP</div>
            <div className="profile-copy">
              <span className="profile-label">Mesero</span>
              <strong>Manuel Panameño</strong>
            </div>
            <Icon name="chevron" size={18} />
          </div>
          <Button className="kitchen-shortcut" onClick={onKitchen}>
            <Icon name="chef" />
            <span>Cocina</span>
          </Button>
        </div>
      </header>

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

          <div className="category-row" aria-label="Categorías">
            {categories.map((category) => (
              <Button
                className={`category-pill ${activeCategory === category ? "category-active" : ""}`}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="products-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  {product.image ? (
                    <img
                      alt={product.name}
                      className="product-image"
                      src={product.image}
                    />
                  ) : (
                    <div className="soda-art" aria-label="Soda fría">
                      <span />
                      <strong>SODA</strong>
                      <i />
                    </div>
                  )}
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-content">
                  <div className="product-name">{product.name}</div>
                  <div className="product-description">{product.description}</div>
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <Button
                      className="add-button"
                      label={`Agregar ${product.name}`}
                      onClick={() => changeQuantity(product.id, 1)}
                    >
                      <Icon name="plus" />
                      <span>Agregar</span>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CartPanel
          cart={cart}
          cartItems={cartItems}
          changeQuantity={changeQuantity}
          itemCount={itemCount}
          onClose={() => setCartOpen(false)}
          onSend={() => setModalOpen(true)}
          open={cartOpen}
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
        <div className="success-toast" role="status">
          <div className="toast-icon">
            <Icon name="check" />
          </div>
          <div>
            <strong>¡Pedido enviado!</strong>
            <span>La cocina ya recibió la comanda.</span>
          </div>
          <Button icon="x" label="Cerrar" onClick={() => setSent(false)} />
        </div>
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

function CartPanel({
  cart,
  cartItems,
  changeQuantity,
  itemCount,
  onClose,
  onSend,
  open,
  total,
}: {
  cart: Cart;
  cartItems: Product[];
  changeQuantity: (id: number, amount: number) => void;
  itemCount: number;
  onClose: () => void;
  onSend: () => void;
  open: boolean;
  total: number;
}) {
  return (
    <>
      {open && <div className="cart-scrim" onClick={onClose} />}
      <aside className={`cart-panel ${open ? "cart-panel-open" : ""}`}>
        <div className="cart-heading">
          <div>
            <span className="eyebrow">Mesa 08</span>
            <div className="cart-title">Tu comanda</div>
          </div>
          <span className="item-badge">{itemCount} artículos</span>
          <Button className="cart-close" icon="x" label="Cerrar" onClick={onClose} />
        </div>

        <div className="cart-items">
          {cartItems.length ? (
            cartItems.map((product) => (
              <div className="cart-item" key={product.id}>
                <div className="cart-item-top">
                  <div>
                    <strong>{product.name}</strong>
                    <span>${product.price.toFixed(2)} c/u</span>
                  </div>
                  <strong>
                    ${(product.price * cart[product.id]).toFixed(2)}
                  </strong>
                </div>
                <div className="quantity-row">
                  <div className="stepper">
                    <Button
                      icon="minus"
                      label={`Quitar ${product.name}`}
                      onClick={() => changeQuantity(product.id, -1)}
                    />
                    <strong>{cart[product.id]}</strong>
                    <Button
                      icon="plus"
                      label={`Agregar ${product.name}`}
                      onClick={() => changeQuantity(product.id, 1)}
                    />
                  </div>
                  <Button
                    className="delete-button"
                    icon="trash"
                    label={`Eliminar ${product.name}`}
                    onClick={() => changeQuantity(product.id, -cart[product.id])}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <div>
                <Icon name="receipt" size={28} />
              </div>
              <strong>Tu comanda está vacía</strong>
              <span>Agrega platos del menú para comenzar.</span>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-line">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="total-line">
            <div>
              <strong>Total</strong>
              <span>Impuestos incluidos</span>
            </div>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <Button
            className="send-button"
            onClick={cartItems.length ? onSend : undefined}
          >
            <Icon name="spark" />
            Enviar a Cocina
            <Icon name="chevron" />
          </Button>
        </div>
      </aside>
    </>
  );
}

function ConfirmModal({
  items,
  onCancel,
  onConfirm,
  quantities,
  total,
}: {
  items: Product[];
  onCancel: () => void;
  onConfirm: () => void;
  quantities: Cart;
  total: number;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="confirm-modal"
        role="dialog"
      >
        <div className="modal-top">
          <div className="warning-icon">
            <Icon name="warning" size={28} />
          </div>
          <div className="modal-title" id="confirm-title">
            ¿Confirmar Envío de Comanda?
          </div>
          <div className="modal-subtitle">
            Revisa el pedido antes de enviarlo. Una vez confirmado, aparecerá
            inmediatamente en cocina.
          </div>
        </div>
        <div className="modal-order">
          <div className="modal-order-label">
            <span>Resumen · Mesa 08</span>
            <span>{items.length} productos</span>
          </div>
          {items.map((item) => (
            <div className="modal-item" key={item.id}>
              <span>
                <strong>{quantities[item.id]}×</strong> {item.name}
              </span>
              <strong>${(item.price * quantities[item.id]).toFixed(2)}</strong>
            </div>
          ))}
          <div className="modal-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <Button className="cancel-button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="confirm-button" onClick={onConfirm}>
            <Icon name="check" />
            Sí, Enviar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}

type TicketStatus = "pending" | "progress" | "done";

const initialTickets = [
  {
    id: 101,
    age: "hace 2 min",
    table: "Mesa 08",
    server: "Manuel",
    status: "pending" as TicketStatus,
    items: ["2× Hamburguesa Clásica", "1× Soda"],
    note: "Sin cebolla",
  },
  {
    id: 102,
    age: "hace 4 min",
    table: "Mesa 03",
    server: "Andrea",
    status: "pending" as TicketStatus,
    items: ["1× Tacos al Pastor", "1× Alitas BBQ", "2× Soda"],
    note: "Salsa aparte",
  },
  {
    id: 100,
    age: "hace 8 min",
    table: "Mesa 12",
    server: "Carlos",
    status: "progress" as TicketStatus,
    items: ["1× Pasta Cremosa", "1× Hamburguesa Clásica"],
    note: null,
  },
];

function KitchenView({ onOrders }: { onOrders: () => void }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const pending = tickets.filter((ticket) => ticket.status === "pending").length;
  const progress = tickets.filter((ticket) => ticket.status === "progress").length;
  const updateTicket = (id: number, status: TicketStatus) => {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)),
    );
  };

  return (
    <div className="kds-shell">
      <header className="kds-header">
        <Brand dark />
        <div className="kds-title-block">
          <span>Kitchen Display</span>
          <strong>Cola de Cocina</strong>
        </div>
        <div className="kds-header-actions">
          <div className="live-badge">
            <i />
            EN VIVO
          </div>
          <div className="clock-block">
            <Icon name="clock" />
            <strong>
              {time.toLocaleTimeString("es-SV", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
              CST
            </strong>
          </div>
          <Button className="orders-shortcut" onClick={onOrders}>
            <Icon name="receipt" />
            <span>Tomar pedido</span>
          </Button>
        </div>
      </header>

      <main className="kds-main">
        <div className="kds-overview">
          <div>
            <span className="kds-eyebrow">Servicio de cena</span>
            <div className="kds-page-title">Órdenes activas</div>
            <p>Los pedidos más antiguos aparecen primero.</p>
          </div>
          <div className="kds-counters">
            <div className="counter counter-pending">
              <span>{pending}</span>
              <div>
                <strong>Pendientes</strong>
                <small>Por comenzar</small>
              </div>
            </div>
            <div className="counter counter-progress">
              <span>{progress}</span>
              <div>
                <strong>En preparación</strong>
                <small>En cocina</small>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-grid">
          {tickets
            .filter((ticket) => ticket.status !== "done")
            .map((ticket) => (
              <article
                className={`ticket-card ticket-${ticket.status}`}
                key={ticket.id}
              >
                <div className="ticket-status-strip" />
                <div className="ticket-header">
                  <div>
                    <span>{ticket.table}</span>
                    <strong>Pedido #{ticket.id}</strong>
                  </div>
                  <div className="ticket-age">
                    <Icon name="clock" size={17} />
                    {ticket.age}
                  </div>
                </div>
                <div className="ticket-meta">
                  <span>Mesero: {ticket.server}</span>
                  <span
                    className={`status-label status-${ticket.status}`}
                  >
                    {ticket.status === "pending"
                      ? "PENDIENTE"
                      : "EN PREPARACIÓN"}
                  </span>
                </div>
                <div className="ticket-items">
                  {ticket.items.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
                {ticket.note && (
                  <div className="ticket-note">
                    <span>NOTA</span>
                    <strong>{ticket.note}</strong>
                  </div>
                )}
                <Button
                  className={`ticket-action action-${ticket.status}`}
                  onClick={() =>
                    updateTicket(
                      ticket.id,
                      ticket.status === "pending" ? "progress" : "done",
                    )
                  }
                >
                  <Icon
                    name={ticket.status === "pending" ? "chef" : "check"}
                  />
                  {ticket.status === "pending"
                    ? "Comenzar Preparación"
                    : "Marcar como Completado"}
                </Button>
              </article>
            ))}
        </div>
        {!tickets.some((ticket) => ticket.status !== "done") && (
          <div className="kds-empty">
            <div>
              <Icon name="check" size={32} />
            </div>
            <strong>Todo al día</strong>
            <span>No hay órdenes activas en este momento.</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"orders" | "kitchen">("orders");

  return screen === "orders" ? (
    <OrderView onKitchen={() => setScreen("kitchen")} />
  ) : (
    <KitchenView onOrders={() => setScreen("orders")} />
  );
}
