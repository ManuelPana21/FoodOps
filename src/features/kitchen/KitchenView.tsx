import { useEffect, useState } from "react";
import { KitchenHeader } from "../../components/layout/KitchenHeader";
import { KitchenCounters } from "./components/KitchenCounters";
import { TicketGrid } from "./components/TicketGrid";
import type { KitchenTicket, TicketStatus } from "../../types/order";
import { apiClient, loadStoredTickets, saveStoredTickets } from "../../services/api";

interface KitchenViewProps {
  onOrders?: () => void;
  onLogout?: () => void;
}

export function KitchenView({ onOrders = () => {}, onLogout }: KitchenViewProps) {
  const [tickets, setTickets] = useState<KitchenTicket[]>(() => loadStoredTickets());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setTickets(loadStoredTickets());
    const timer = window.setInterval(() => setTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const pending = tickets.filter((ticket) => ticket.status === "pending").length;
  const progress = tickets.filter((ticket) => ticket.status === "progress").length;

  const updateTicket = (id: number, status: TicketStatus) => {
    setTickets((current) => {
      const updated = current.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket,
      );
      saveStoredTickets(updated);
      return updated;
    });
    apiClient.updateTicketStatus(id, status).catch(() => {
      // Fallback local store already updated
    });
  };

  return (
    <div className="kds-shell">
      <KitchenHeader
        currentTime={time}
        onOrders={onOrders}
        onLogout={onLogout}
      />

      <main className="kds-main">
        <div className="kds-overview">
          <div>
            <span className="kds-eyebrow">Servicio de cena</span>
            <div className="kds-page-title">Órdenes activas</div>
            <p>Los pedidos más antiguos aparecen primero.</p>
          </div>
          <KitchenCounters
            pendingCount={pending}
            progressCount={progress}
          />
        </div>

        <TicketGrid
          tickets={tickets}
          onUpdateStatus={updateTicket}
        />
      </main>
    </div>
  );
}
