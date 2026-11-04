import { useEffect, useState } from "react";
import { KitchenHeader } from "../../components/layout/KitchenHeader";
import { KitchenCounters } from "./components/KitchenCounters";
import { TicketGrid } from "./components/TicketGrid";
import type { KitchenTicket, TicketStatus } from "../../types/order";

const initialTickets: KitchenTicket[] = [
  {
    id: 101,
    age: "hace 2 min",
    table: "Mesa 08",
    server: "Manuel",
    status: "pending",
    items: ["2× Hamburguesa Clásica", "1× Soda"],
    note: "Sin cebolla",
  },
  {
    id: 102,
    age: "hace 4 min",
    table: "Mesa 03",
    server: "Andrea",
    status: "pending",
    items: ["1× Tacos al Pastor", "1× Alitas BBQ", "2× Soda"],
    note: "Salsa aparte",
  },
  {
    id: 100,
    age: "hace 8 min",
    table: "Mesa 12",
    server: "Carlos",
    status: "progress",
    items: ["1× Pasta Cremosa", "1× Hamburguesa Clásica"],
    note: "Término medio para la hamburguesa",
  },
];

interface KitchenViewProps {
  onOrders?: () => void;
  onLogout?: () => void;
}

export function KitchenView({ onOrders = () => {}, onLogout }: KitchenViewProps) {
  const [tickets, setTickets] = useState<KitchenTicket[]>(initialTickets);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const progressCount = tickets.filter((t) => t.status === "progress").length;

  const updateTicketStatus = (id: number, status: TicketStatus) => {
    setTickets((current) =>
      current.map((t) => (t.id === id ? { ...t, status } : t)),
    );
  };

  return (
    <div className="kds-shell">
      <KitchenHeader
        currentTime={currentTime}
        onOrders={onOrders}
        onLogout={onLogout}
      />

      <main className="kds-main">
        <div className="kds-overview">
          <div>
            <span className="kds-eyebrow">Servicio de Cocina · KDS</span>
            <div className="kds-page-title">Cola de Comandas Activas</div>
            <p>Monitoreo en tiempo real. Los pedidos prioritarios y de mayor tiempo aparecen primero.</p>
          </div>

          <KitchenCounters
            pendingCount={pendingCount}
            progressCount={progressCount}
          />
        </div>

        <TicketGrid
          tickets={tickets}
          onUpdateStatus={updateTicketStatus}
        />
      </main>
    </div>
  );
}
