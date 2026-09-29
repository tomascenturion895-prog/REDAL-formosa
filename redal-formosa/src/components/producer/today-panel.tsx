interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

interface TodayPanelProps {
  orders: unknown[];
  published: number;
  inReview: number;
  checklist: ChecklistItem[];
}

export function TodayPanel({ orders, published, inReview, checklist }: TodayPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card p-4">
        <p className="text-muted text-sm">Pedidos pendientes</p>
        <p className="text-title text-2xl font-bold">{orders.length}</p>
      </div>
      <div className="card p-4">
        <p className="text-muted text-sm">Productos publicados</p>
        <p className="text-title text-2xl font-bold">{published}</p>
      </div>
      <div className="card p-4">
        <p className="text-muted text-sm">En revisión</p>
        <p className="text-title text-2xl font-bold">{inReview}</p>
      </div>
      <div className="card p-4">
        <p className="text-muted text-sm">Tareas pendientes</p>
        <p className="text-title text-2xl font-bold">{checklist.filter((c) => !c.done).length}</p>
      </div>
    </div>
  );
}

export type { ChecklistItem };
