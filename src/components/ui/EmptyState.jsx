export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto flex max-w-sm animate-rise flex-col items-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <span className="flex size-14 -rotate-3 items-center justify-center rounded-md bg-surface text-accent shadow-note">
          <Icon aria-hidden className="size-6" />
        </span>
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      {children && <p className="text-sm leading-relaxed text-ink-soft">{children}</p>}
      {action}
    </div>
  );
}
