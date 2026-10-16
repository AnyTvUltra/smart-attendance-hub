import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "teacher" | "viewer";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user);
      if (data.user) {
        const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
        if (active) setRoles((r ?? []).map((x) => x.role as Role));
      }
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, []);

  const isAdmin = roles.includes("admin");
  const canEdit = isAdmin || roles.includes("teacher");
  const roleLabel = isAdmin ? "مدير" : roles.includes("teacher") ? "معلم" : "مشاهد";
  return { user, roles, loading, isAdmin, canEdit, roleLabel };
}
