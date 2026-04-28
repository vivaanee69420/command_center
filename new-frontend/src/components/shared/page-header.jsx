export default function PageHeader({ icon, title, subtitle, actions, right }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        {actions?.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={
              action.variant === "primary"
                ? "flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition"
                : "flex items-center gap-1.5 px-4 py-2 border border-line rounded-lg text-xs font-medium text-ink hover:bg-bg-soft transition"
            }
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
