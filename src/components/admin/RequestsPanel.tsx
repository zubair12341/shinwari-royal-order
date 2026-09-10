import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown> & { id: string; status: string };

export function RequestsPanel({ kind }: { kind: "reservations" | "catering_requests" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const statuses =
    kind === "reservations"
      ? ["pending", "confirmed", "cancelled", "completed"]
      : ["pending", "contacted", "confirmed", "cancelled", "completed"];

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(kind)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [kind]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from(kind).update({ status } as never).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success("Updated");
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => void load()}>
        Refresh
      </Button>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      )}
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{String(r['full_name'] ?? "")}</p>
              <p className="text-sm text-muted-foreground">{String(r['phone'] ?? "")}</p>
              {kind === "reservations" ? (
                <p className="mt-1 text-sm">
                  {String(r['reservation_date'])} at {String(r['reservation_time'])} ·{" "}
                  {String(r['guests'])} guests
                </p>
              ) : (
                <p className="mt-1 text-sm">
                  {String(r['event_date'])} · {String(r['guests'] ?? "?")} guests ·{" "}
                  {String(r['event_type'] ?? "")}
                </p>
              )}
              {Boolean(r['special_request'] || r['requirements']) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {String(r['special_request'] ?? r['requirements'] ?? "")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => void setStatus(r.id, s)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] capitalize ${
                    r.status === s
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
