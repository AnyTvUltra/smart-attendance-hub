import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScanFace } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — حضور" },
      { name: "description", content: "الدخول إلى نظام حضور الطلاب." },
      { property: "og:title", content: "تسجيل الدخول — حضور" },
      { property: "og:description", content: "الدخول إلى نظام حضور الطلاب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. تحقق من بريدك لتأكيده.");
        setMode("in");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-soft">
        <Link to="/" className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-primary">
          <ScanFace className="size-6" /> حضور
        </Link>
        <h1 className="text-2xl font-bold">{mode === "in" ? "تسجيل الدخول" : "حساب جديد"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "in" ? "أدخل بريدك وكلمة المرور." : "أول حساب يُنشأ يصبح مديراً للنظام."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "up" && (
            <div className="space-y-1.5"><Label>الاسم</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          )}
          <div className="space-y-1.5"><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label>كلمة المرور</Label><Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "دخول" : "إنشاء الحساب"}</Button>
        </form>
        <button className="mt-4 w-full text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </main>
  );
}
