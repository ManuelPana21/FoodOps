import { useEffect, useState } from "react";
import { KitchenHeader } from "../../components/layout/KitchenHeader";
import { KitchenCounters } from "./components/KitchenCounters";
import { TicketGrid } from "./components/TicketGrid";
import { Button } from "../../components/common/Button";
import type { KitchenTicket, TicketStatus } from "../../types/order";
import { apiClient, loadStoredTickets, saveStoredTickets } from "../../services/api";

interface KitchenViewProps {
  readOnly?: boolean;
  onOrders?: () => void;
  onBilling?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

type KitchenFilter = "active" | "done";

export function KitchenView({
  readOnly = false,
  onOrders,
  onBilling,
  onAdmin,
  onLogout,
}: KitchenViewProps) {
  const [tickets, setTickets] = useState<KitchenTicket[]>(() => loadStoredTickets());
  const [filter, setFilter] = useState<KitchenFilter>("active");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setTickets(loadStoredTickets());
    const timer = window.setInterval(() => setTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const pending = tickets.filter((ticket) => ticket.status === "pending").length;
  const progress = tickets.filter((ticket) => ticket.status === "progress").length;
  const done = tickets.filter((ticket) => ticket.status === "done").length;

  const visibleTickets =
    filter === "active"
      ? tickets.filter((ticket) => ticket.status !== "done")
      : tickets.filter((ticket) => ticket.status === "done");

  const updateTicket = (id: number, status: TicketStatus) => {
    if (readOnly) return;
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
        readOnly={readOnly}
        onOrders={onOrders}
        onBilling={onBilling}
        onAdmin={onAdmin}
        onLogout={onLogout}
      />

      <main className="kds-main">
        <div className="kds-overview">
          <div>
            <span className="kds-eyebrow">
              {readOnly ? "Revisión de Estado · Mesero" : "Servicio de Cocina"}
            </span>
            <div className="kds-page-title">
              {filter === "active" ? "Órdenes activas" : "Pedidos entregados"}
            </div>
            <p>
              {readOnly
                ? "Visualiza en tiempo real qué comandas están pendientes, cocinando o entregadas."
                : "Procesa las comandas de pendiente a cocinando y márcalas como entregadas."}
            </p>
          </div>
          <KitchenCounters
            pendingCount={pending}
            progressCount={progress}
            doneCount={done}
          />
        </div>

        <div className="kds-filter-bar">
          <Button
            className={`kds-filter-tab ${filter === "active" ? "kds-filter-tab-active" : ""}`}
            onClick={() => setFilter("active")}
          >
            En Cola ({pending + progress})
          </Button>
          <Button
            className={`kds-filter-tab ${filter === "done" ? "kds-filter-tab-active" : ""}`}
            onClick={() => setFilter("done")}
          >
            Entregados ({done})
          </Button>
        </div>

        <TicketGrid
          tickets={visibleTickets}
          readOnly={readOnly}
          emptyTitle={filter === "active" ? "Todo al día" : "Sin entregas registradas"}
          emptyMessage={
            filter === "active"
              ? "No hay órdenes pendientes o cocinando en este momento."
              : "Aún no se han marcado pedidos como entregados en este turno."
          }
          onUpdateStatus={updateTicket}
        />
      </main>
    </div>
  );
}
