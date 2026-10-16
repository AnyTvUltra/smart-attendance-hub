import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanFace, CalendarCheck, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حضور — تسجيل حضور الطلاب بالتعرف على الوجوه" },
      { name: "description", content: "كاميرا عند باب المدرسة تسجّل حضور الطلاب وتأخرهم تلقائياً، مع سجلات وتقارير وصلاحيات." },
      { property: "og:title", content: "حضور — نظام الحضور بالتعرف على الوجوه" },
      { property: "og:description", content: "تسجيل تلقائي للحضور والتأخير، تقارير Excel، وصلاحيات للمدير والمعلم والمشاهد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ScanFace, t: "تعرّف تلقائي", d: "يمرّ الطالب أمام الكاميرا فيُسجَّل حاضراً أو متأخراً مع دقائق التأخير." },
  { icon: CalendarCheck, t: "سجل كامل", d: "يومي وشهري وسنوي لكل طالب، مرتّب حسب الصف والشعبة." },
  { icon: FileSpreadsheet, t: "تقارير", d: "تصدير إلى Excel أو طباعة مباشرة." },
  { icon: ShieldCheck, t: "خصوصية", d: "لا يُحفظ أي فيديو، والوجوه غير المسجلة تُتجاهل تماماً." },
];

function Index() {
  return (
    <main className="min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <ScanFace className="size-7 text-accent" /> حضور
          </div>
          <Button asChild variant="accent"><Link to="/auth">تسجيل الدخول</Link></Button>
        </header>
        <section className="py-20 md:py-28">
          <p className="mb-4 text-sm font-medium text-accent">نظام الحضور المدرسي</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            الطالب يمرّ من الباب،
            <br />
            <span className="text-accent">والحضور يُسجَّل وحده.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-80">
            كاميرا عند مدخل المدرسة تتعرف على الطلاب المسجلين وتحسب التأخير من وقت بدء الدوام. ومن لا يظهر يُحسب غائباً.
          </p>
          <div className="mt-10 flex gap-3">
            <Button asChild size="lg" variant="accent"><Link to="/auth">ابدأ الآن</Link></Button>
          </div>
        </section>
        <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-xl border border-sidebar-border bg-sidebar-accent p-5">
              <f.icon className="mb-3 size-6 text-accent" />
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm opacity-75">{f.d}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
