import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { KitchenTicket, TicketStatus } from "../../../types/order";

interface TicketCardProps {
  ticket: KitchenTicket;
  onUpdateStatus: (id: number, nextStatus: TicketStatus) => void;
}

export function TicketCard({ ticket, onUpdateStatus }: TicketCardProps) {
  const isPending = ticket.status === "pending";
  const isProgress = ticket.status === "progress";

  const nextStatus: TicketStatus = isPending ? "progress" : "done";
  const actionLabel = isPending
    ? "Comenzar Preparación"
    : "Marcar como Completado";
  const actionIcon = isPending ? "chef" : "check";

  return (
    <article
      className={`ticket-card ticket-${ticket.status}`}
      aria-label={`Comanda ${ticket.table} - Pedido #${ticket.id}`}
    >
      <div className="ticket-status-strip" />

      <div className="ticket-header">
        <div>
          <span>{ticket.table}</span>
          <strong>Pedido #{ticket.id}</strong>
        </div>
        <div className="ticket-age">
          <Icon name="clock" size={17} />
          <span>{ticket.age}</span>
        </div>
      </div>

      <div className="ticket-meta">
        <span>Mesero: {ticket.server}</span>
        <span className={`status-label status-${ticket.status}`}>
          {isPending ? "PENDIENTE" : isProgress ? "EN PREPARACIÓN" : "COMPLETADO"}
        </span>
      </div>

      <div className="ticket-items">
        {ticket.items.map((item, index) => (
          <div key={`${ticket.id}-item-${index}`}>{item}</div>
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
        icon={actionIcon}
        label={`${actionLabel} para pedido #${ticket.id}`}
        onClick={() => onUpdateStatus(ticket.id, nextStatus)}
      >
        <span>{actionLabel}</span>
      </Button>
    </article>
  );
}
