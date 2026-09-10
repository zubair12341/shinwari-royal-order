import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  opening_time: string | null;
  closing_time: string | null;
  delivery_fee: number;
  is_open: boolean;
  delivery_available: boolean;
  pickup_available: boolean;
};

export function BranchesPanel() {
  const [branches, setBranches] = useState<Branch[]>([]);

  async function load() {
    const { data, error } = await supabase
      .from("branches")
      .select(
        "id, name, address, phone, whatsapp, opening_time, closing_time, delivery_fee, is_open, delivery_available, pickup_available",
      )
      .order("sort_order");
    if (error) toast.error(error.message);
    setBranches((data ?? []) as unknown as Branch[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patch(id: string, p: Partial<Branch>) {
    const { error } = await supabase.from("branches").update(p as never).eq("id", id);
    if (error) return toast.error(error.message);
    setBranches((l) => l.map((b) => (b.id === id ? { ...b, ...p } : b)));
    toast.success("Saved");
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {branches.map((b) => (
        <div key={b.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-lg">{b.name}</h3>
          {(
            [
              ["address", "Address"],
              ["phone", "Phone"],
              ["whatsapp", "WhatsApp number (e.g. 923001234567)"],
              ["opening_time", "Opens (HH:MM)"],
              ["closing_time", "Closes (HH:MM)"],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                defaultValue={(b[field] as string | null) ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== ((b[field] as string | null) ?? ""))
                    void patch(b.id, { [field]: e.target.value || null } as Partial<Branch>);
                }}
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs">Delivery fee</Label>
            <Input
              type="number"
              defaultValue={b.delivery_fee}
              onBlur={(e) => {
                const v = Number(e.target.value || 0);
                if (v !== b.delivery_fee) void patch(b.id, { delivery_fee: v });
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(
              [
                ["is_open", "Open now"],
                ["delivery_available", "Delivery"],
                ["pickup_available", "Pickup"],
              ] as const
            ).map(([field, label]) => (
              <button
                key={field}
                onClick={() => void patch(b.id, { [field]: !b[field] } as Partial<Branch>)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  b[field] ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {label}: {b[field] ? "on" : "off"}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
