import { TicketCard } from "./TicketCard";
import { Icon } from "../../../components/common/Icon";
import type { KitchenTicket, TicketStatus } from "../../../types/order";

interface TicketGridProps {
  tickets: KitchenTicket[];
  onUpdateStatus: (id: number, nextStatus: TicketStatus) => void;
}

export function TicketGrid({ tickets, onUpdateStatus }: TicketGridProps) {
  const activeTickets = tickets.filter((ticket) => ticket.status !== "done");

  return (
    <>
      <div className="ticket-grid">
        {activeTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onUpdateStatus={onUpdateStatus}
          />
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
    </>
  );
}
