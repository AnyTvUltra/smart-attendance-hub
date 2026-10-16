import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, ScanFace, Users, FileSpreadsheet, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const nav = [
  { to: "/dashboard", label: "اليوم", icon: LayoutDashboard },
  { to: "/kiosk", label: "كاميرا الباب", icon: ScanFace },
  { to: "/students", label: "الطلاب", icon: Users },
  { to: "/reports", label: "التقارير", icon: FileSpreadsheet },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

function Layout() {
  const { user, roleLabel } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 font-display text-xl font-bold">
          <ScanFace className="size-6 text-accent" /> حضور
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 transition hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "bg-sidebar-accent !opacity-100 font-semibold" }}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-4 text-xs">
          <div className="truncate opacity-80">{user?.email}</div>
          <div className="mt-1 inline-block rounded bg-accent px-2 py-0.5 font-semibold text-accent-foreground">{roleLabel}</div>
          <button
            className="mt-3 flex items-center gap-2 opacity-70 hover:opacity-100"
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
          >
            <LogOut className="size-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <nav className="no-print flex gap-1 overflow-x-auto bg-sidebar p-2 text-sidebar-foreground md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex shrink-0 items-center gap-1 rounded px-3 py-1.5 text-xs" activeProps={{ className: "bg-sidebar-accent" }}>
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <main className="print-full mx-auto max-w-6xl p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
