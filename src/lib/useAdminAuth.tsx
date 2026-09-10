import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type AdminSession = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  isStaff: boolean;
  isAdmin: boolean;
};

export function useAdminAuth(): AdminSession & { refresh: () => void } {
  const [state, setState] = useState<AdminSession>({
    loading: true,
    userId: null,
    email: null,
    isStaff: false,
    isAdmin: false,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (!user) {
        if (!cancelled)
          setState({ loading: false, userId: null, email: null, isStaff: false, isAdmin: false });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const list = (roles ?? []).map((r) => r.role as string);
      if (!cancelled)
        setState({
          loading: false,
          userId: user.id,
          email: user.email ?? null,
          isAdmin: list.includes("admin"),
          isStaff: list.includes("admin") || list.includes("staff"),
        });
    }

    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [tick]);

  return { ...state, refresh: () => setTick((t) => t + 1) };
}
