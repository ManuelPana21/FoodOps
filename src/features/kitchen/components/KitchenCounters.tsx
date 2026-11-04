interface KitchenCountersProps {
  pendingCount: number;
  progressCount: number;
}

export function KitchenCounters({
  pendingCount,
  progressCount,
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
          <strong>En preparación</strong>
          <small>En cocina</small>
        </div>
      </div>
    </div>
  );
}
