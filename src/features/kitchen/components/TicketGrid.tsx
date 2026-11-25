import { TicketCard } from "./TicketCard";
import { Icon } from "../../../components/common/Icon";
import type { KitchenTicket, TicketStatus } from "../../../types/order";

interface TicketGridProps {
  tickets: KitchenTicket[];
  readOnly?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onUpdateStatus: (id: number, nextStatus: TicketStatus) => void;
}

export function TicketGrid({
  tickets,
  readOnly = false,
  emptyTitle = "Todo al día",
  emptyMessage = "No hay órdenes en esta vista en este momento.",
  onUpdateStatus,
}: TicketGridProps) {
  return (
    <>
      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            readOnly={readOnly}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>
      {tickets.length === 0 && (
        <div className="kds-empty">
          <div>
            <Icon name="check" size={32} />
          </div>
          <strong>{emptyTitle}</strong>
          <span>{emptyMessage}</span>
        </div>
      )}
    </>
  );
}
