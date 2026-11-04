import { TicketCard } from "./TicketCard";
import { Icon } from "../../../components/common/Icon";
import type { KitchenTicket, TicketStatus } from "../../../types/order";

interface TicketGridProps {
  tickets: KitchenTicket[];
  onUpdateStatus: (id: number, nextStatus: TicketStatus) => void;
}

export function TicketGrid({ tickets, onUpdateStatus }: TicketGridProps) {
  const activeTickets = tickets.filter((ticket) => ticket.status !== "done");

  if (activeTickets.length === 0) {
    return (
      <div className="kds-empty" role="status" aria-label="Sin comandas activas">
        <div>
          <Icon name="check" size={32} />
        </div>
        <strong>Todo al día en cocina</strong>
        <span>No hay comandas activas pendientes de preparación en este momento.</span>
      </div>
    );
  }

  return (
    <div className="ticket-grid" role="region" aria-label="Lista de comandas activas">
      {activeTickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
