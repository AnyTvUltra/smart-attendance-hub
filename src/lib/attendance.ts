export type Status = "present" | "late" | "absent" | "excused";

export const STATUS_LABEL: Record<Status, string> = {
  present: "حاضر",
  late: "متأخر",
  absent: "غائب",
  excused: "معذور",
};

export const STATUS_CLASS: Record<Status, string> = {
  present: "bg-present/15 text-present border-present/30",
  late: "bg-late/20 text-accent-foreground border-late/40",
  absent: "bg-absent/15 text-absent border-absent/30",
  excused: "bg-excused/15 text-excused border-excused/30",
};

/** Minutes since midnight from "HH:MM" or "HH:MM:SS". */
export function timeToMinutes(t: string): number {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Status for an arrival. Late when arriving after start + grace;
 * late minutes are counted from the official start time.
 */
export function computeArrival(arrival: Date, startTime: string, graceMinutes: number) {
  const arrivalMin = arrival.getHours() * 60 + arrival.getMinutes();
  const start = timeToMinutes(startTime);
  const diff = arrivalMin - start;
  if (diff > graceMinutes) return { status: "late" as Status, lateMinutes: diff };
  return { status: "present" as Status, lateMinutes: 0 };
}

/** Local YYYY-MM-DD. */
export function localDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function euclidean(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += ((a[i] ?? 0) - (b[i] ?? 0)) ** 2;
  return Math.sqrt(s);
}

/** Best match under threshold, or null (unknown faces are ignored). */
export function bestMatch<T extends { id: string; descriptor: number[] }>(
  query: number[],
  people: T[],
  threshold: number,
): T | null {
  let best: T | null = null;
  let bestD = Infinity;
  for (const p of people) {
    const d = euclidean(query, p.descriptor);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best && bestD <= threshold ? best : null;
}
