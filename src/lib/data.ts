import { supabase } from "@/integrations/supabase/client";
import type { Status } from "./attendance";

export type Student = {
  id: string;
  student_code: string | null;
  full_name: string;
  grade: string;
  section: string;
  face_descriptor: number[] | null;
  notes: string | null;
  active: boolean;
};

export type AttendanceRow = {
  id: string;
  student_id: string;
  date: string;
  status: Status;
  arrival_time: string | null;
  late_minutes: number;
  note: string | null;
  source: string;
};

export type Settings = {
  school_name: string;
  start_time: string;
  grace_minutes: number;
  match_threshold: number;
};

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*").order("grade").order("section").order("full_name");
  if (error) throw error;
  return (data ?? []) as unknown as Student[];
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as Settings;
}

export async function fetchAttendance(from: string, to: string, studentId?: string): Promise<AttendanceRow[]> {
  let q = supabase.from("attendance").select("*").gte("date", from).lte("date", to);
  if (studentId) q = q.eq("student_id", studentId);
  const { data, error } = await q.limit(10000);
  if (error) throw error;
  return (data ?? []) as AttendanceRow[];
}

export async function setStatus(studentId: string, date: string, status: Status, note?: string) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("attendance").upsert(
    {
      student_id: studentId,
      date,
      status,
      note: note ?? null,
      source: "manual",
      updated_by: u.user?.id ?? null,
      updated_at: new Date().toISOString(),
      ...(status === "absent" || status === "excused" ? { late_minutes: 0 } : {}),
    },
    { onConflict: "student_id,date" },
  );
  if (error) throw error;
}

export function classKey(s: { grade: string; section: string }) {
  return `${s.grade} / ${s.section}`;
}

/** Days between from..to inclusive that are school days (excludes Fri & Sat). */
export function schoolDays(from: string, to: string, today = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (d <= end && d <= today) {
    const wd = d.getDay();
    if (wd !== 5 && wd !== 6) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function summarize(days: string[], rows: AttendanceRow[]) {
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const c = { present: 0, late: 0, absent: 0, excused: 0, lateMinutes: 0 };
  for (const d of days) {
    const r = byDate.get(d);
    const st: Status = r?.status ?? "absent";
    c[st]++;
    c.lateMinutes += r?.late_minutes ?? 0;
  }
  return c;
}
