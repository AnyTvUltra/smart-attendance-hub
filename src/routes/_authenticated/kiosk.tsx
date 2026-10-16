import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings, fetchStudents, classKey, type Student } from "@/lib/data";
import { bestMatch, computeArrival, localDate, type Status } from "@/lib/attendance";
import { detectAll, loadFaceApi, startCamera, stopCamera } from "@/lib/face";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/kiosk")({
  head: () => ({ meta: [{ title: "كاميرا الباب — حضور" }, { name: "description", content: "تسجيل الحضور بالتعرف على الوجوه." }] }),
  component: Kiosk,
});

type Log = { id: string; name: string; cls: string; status: Status; late: number; at: Date };

function Kiosk() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);
  const seenRef = useRef<Set<string>>(new Set());
  const [state, setState] = useState<"idle" | "loading" | "running" | "error">("idle");
  const [error, setError] = useState("");
  const [log, setLog] = useState<Log[]>([]);
  const [enrolled, setEnrolled] = useState(0);
  const { canEdit } = useAuth();

  useEffect(() => () => { runningRef.current = false; stopCamera(streamRef.current); }, []);

  const start = async () => {
    setState("loading");
    try {
      const [students, settings] = await Promise.all([fetchStudents(), fetchSettings(), loadFaceApi()]);
      const people = students
        .filter((s): s is Student & { face_descriptor: number[] } => s.active && Array.isArray(s.face_descriptor))
        .map((s) => ({ ...s, id: s.id, descriptor: s.face_descriptor }));
      setEnrolled(people.length);
      const today = localDate();
      const { data: existing } = await supabase.from("attendance").select("student_id").eq("date", today);
      seenRef.current = new Set((existing ?? []).map((r) => r.student_id));

      streamRef.current = await startCamera(videoRef.current!);
      runningRef.current = true;
      setState("running");

      const loop = async () => {
        if (!runningRef.current || !videoRef.current) return;
        try {
          const faces = await detectAll(videoRef.current);
          for (const f of faces) {
            const m = bestMatch(Array.from(f.descriptor), people, settings.match_threshold);
            if (!m || seenRef.current.has(m.id)) continue; // unknown faces: ignored, nothing stored
            seenRef.current.add(m.id);
            const now = new Date();
            const { status, lateMinutes } = computeArrival(now, settings.start_time, settings.grace_minutes);
            const { error } = await supabase.from("attendance").insert({
              student_id: m.id, date: localDate(now), status, arrival_time: now.toISOString(), late_minutes: lateMinutes, source: "auto",
            });
            if (!error) setLog((l) => [{ id: m.id, name: m.full_name, cls: classKey(m), status, late: lateMinutes, at: now }, ...l].slice(0, 30));
          }
        } catch (e) { console.error(e); }
        setTimeout(loop, 400);
      };
      loop();
    } catch (e) {
      setError((e as Error).message);
      setState("error");
    }
  };

  const stop = () => { runningRef.current = false; stopCamera(streamRef.current); setState("idle"); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">كاميرا الباب</h1>
          <p className="text-sm text-muted-foreground">لا يُحفظ أي فيديو. الوجوه غير المسجلة تُتجاهل.</p>
        </div>
        {state === "running" ? (
          <Button variant="outline" onClick={stop}><CameraOff /> إيقاف</Button>
        ) : (
          <Button onClick={start} disabled={state === "loading" || !canEdit}><Camera /> {state === "loading" ? "جارٍ التحميل…" : "تشغيل الكاميرا"}</Button>
        )}
      </div>
      {!canEdit && <p className="rounded-lg bg-muted p-3 text-sm">تشغيل الكاميرا متاح للمدير والمعلم فقط.</p>}
      {state === "error" && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">تعذّر تشغيل الكاميرا: {error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sidebar shadow-soft">
          <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
          {state !== "running" && (
            <div className="absolute inset-0 flex items-center justify-center text-sidebar-foreground/60">الكاميرا متوقفة</div>
          )}
          {state === "running" && (
            <div className="absolute start-3 top-3 rounded-full bg-present px-3 py-1 text-xs font-semibold text-primary-foreground">
              ● يعمل — {enrolled} طالب مسجّل الوجه
            </div>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-semibold">آخر التسجيلات</h2>
          {log.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تسجيلات بعد.</p>}
          <ul className="space-y-2">
            {log.map((l) => (
              <li key={l.id + l.at.getTime()} className="flex items-center gap-3 rounded-lg bg-muted/60 p-2.5 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="size-5 shrink-0 text-present" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.cls} · {l.at.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}{l.late ? ` · ${l.late} د تأخير` : ""}</div>
                </div>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
