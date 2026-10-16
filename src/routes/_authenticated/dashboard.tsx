import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard, StatusBadge } from "@/components/StatusBadge";
import { fetchAttendance, fetchStudents, setStatus, classKey } from "@/lib/data";
import { localDate, STATUS_LABEL, type Status } from "@/lib/attendance";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "حضور اليوم — حضور" }, { name: "description", content: "حالة حضور الطلاب اليوم." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [date, setDate] = useState(localDate());
  const [cls, setCls] = useState("all");
  const { canEdit } = useAuth();
  const qc = useQueryClient();
  const students = useQuery({ queryKey: ["students"], queryFn: fetchStudents });
  const att = useQuery({ queryKey: ["attendance", date], queryFn: () => fetchAttendance(date, date), refetchInterval: 10000 });

  const rows = useMemo(() => {
    const map = new Map((att.data ?? []).map((a) => [a.student_id, a]));
    return (students.data ?? [])
      .filter((s) => s.active && (cls === "all" || classKey(s) === cls))
      .map((s) => ({ s, a: map.get(s.id) }));
  }, [students.data, att.data, cls]);

  const classes = useMemo(() => [...new Set((students.data ?? []).map(classKey))], [students.data]);
  const count = (st: Status) => rows.filter((r) => (r.a?.status ?? "absent") === st).length;

  const change = async (id: string, st: Status) => {
    try {
      await setStatus(id, date, st);
      qc.invalidateQueries({ queryKey: ["attendance", date] });
      toast.success("تم التحديث");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الحضور</h1>
          <p className="text-sm text-muted-foreground">من لم يُسجَّل حضوره يُحسب غائباً.</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الصفوف</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="حاضر" value={count("present")} status="present" />
        <StatCard label="متأخر" value={count("late")} status="late" />
        <StatCard label="غائب" value={count("absent")} status="absent" />
        <StatCard label="معذور" value={count("excused")} status="excused" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr><th className="p-3 text-start">الطالب</th><th className="p-3 text-start">الصف / الشعبة</th><th className="p-3 text-start">وقت الوصول</th><th className="p-3 text-start">التأخير</th><th className="p-3 text-start">الحالة</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد طلاب. <Link to="/students" className="text-primary">أضف طلاباً</Link></td></tr>
            )}
            {rows.map(({ s, a }) => {
              const st: Status = a?.status ?? "absent";
              return (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium"><Link to="/students/$id" params={{ id: s.id }} className="hover:text-primary">{s.full_name}</Link></td>
                  <td className="p-3 text-muted-foreground">{classKey(s)}</td>
                  <td className="p-3 tabular-nums">{a?.arrival_time ? new Date(a.arrival_time).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td className="p-3 tabular-nums">{a?.late_minutes ? `${a.late_minutes} د` : "—"}</td>
                  <td className="p-3">
                    {canEdit ? (
                      <Select value={st} onValueChange={(v) => change(s.id, v as Status)}>
                        <SelectTrigger className="h-8 w-28 border-0 p-0 shadow-none"><StatusBadge status={st} /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABEL) as Status[]).map((k) => <SelectItem key={k} value={k}>{STATUS_LABEL[k]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : <StatusBadge status={st} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
