function StatCard({ label, tone, value }) {
  const valueClassName = {
    green: "text-success",
    amber: "text-warning",
    blue: "text-secondary",
    slate: "text-text-primary",
  }[tone] || "text-text-primary";

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <span className="block text-sm text-text-secondary">{label}</span>
      <strong className={`mt-3 block text-2xl font-semibold ${valueClassName}`}>
        {value}
      </strong>
    </article>
  );
}

export default StatCard;
