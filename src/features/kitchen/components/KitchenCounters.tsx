interface KitchenCountersProps {
  pendingCount: number;
  progressCount: number;
  doneCount: number;
}

export function KitchenCounters({
  pendingCount,
  progressCount,
  doneCount,
}: KitchenCountersProps) {
  return (
    <div className="kds-counters">
      <div className="counter counter-pending">
        <span>{pendingCount}</span>
        <div>
          <strong>Pendientes</strong>
          <small>Por comenzar</small>
        </div>
      </div>
      <div className="counter counter-progress">
        <span>{progressCount}</span>
        <div>
          <strong>Cocinando</strong>
          <small>En preparación</small>
        </div>
      </div>
      <div className="counter counter-done">
        <span>{doneCount}</span>
        <div>
          <strong>Entregados</strong>
          <small>Listos / Servidos</small>
        </div>
      </div>
    </div>
  );
}
