import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { KitchenTicket, TicketStatus } from "../../../types/order";

interface TicketCardProps {
  ticket: KitchenTicket;
  readOnly?: boolean;
  onUpdateStatus: (id: number, nextStatus: TicketStatus) => void;
}

const statusLabels: Record<TicketStatus, string> = {
  pending: "PENDIENTE",
  progress: "COCINANDO",
  done: "ENTREGADO",
};

export function TicketCard({
  ticket,
  readOnly = false,
  onUpdateStatus,
}: TicketCardProps) {
  return (
    <article className={`ticket-card ticket-${ticket.status}`}>
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
        <span className={`status-label status-${ticket.status}`}>
          {statusLabels[ticket.status]}
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
      {!readOnly && ticket.status !== "done" && (
        <Button
          className={`ticket-action action-${ticket.status}`}
          onClick={() =>
            onUpdateStatus(
              ticket.id,
              ticket.status === "pending" ? "progress" : "done",
            )
          }
        >
          <Icon name={ticket.status === "pending" ? "chef" : "check"} />
          {ticket.status === "pending"
            ? "Comenzar a Cocinar"
            : "Marcar como Entregado"}
        </Button>
      )}
    </article>
  );
}
