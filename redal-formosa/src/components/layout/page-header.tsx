export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div>
        <h1 className="text-title">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
