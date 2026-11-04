interface KitchenCountersProps {
  pendingCount: number;
  progressCount: number;
}

export function KitchenCounters({
  pendingCount,
  progressCount,
}: KitchenCountersProps) {
  return (
    <div className="kds-counters" role="region" aria-label="Contadores de cocina">
      <div className="counter counter-pending" aria-label={`${pendingCount} órdenes pendientes`}>
        <span>{pendingCount}</span>
        <div>
          <strong>Pendientes</strong>
          <small>Por comenzar</small>
        </div>
      </div>

      <div
        className="counter counter-progress"
        aria-label={`${progressCount} órdenes en preparación`}
      >
        <span className="counter-progress-badge">{progressCount}</span>
        <div>
          <strong className="text-amber-500">En preparación</strong>
          <small>En proceso culinario</small>
        </div>
      </div>
    </div>
  );
}
