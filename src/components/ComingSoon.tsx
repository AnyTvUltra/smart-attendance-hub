export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-soft">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">هذه الصفحة لم تُكتمل بعد.</p>
    </div>
  );
}
