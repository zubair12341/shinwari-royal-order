import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { BranchesPanel } from "@/components/admin/BranchesPanel";
import { MenuPanel } from "@/components/admin/MenuPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { RequestsPanel } from "@/components/admin/RequestsPanel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/useAdminAuth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Dashboard | Arabic Shinwari Restaurant" },
      { name: "description", content: "Manage orders, menu, reservations, catering and branches." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff Dashboard | Arabic Shinwari Restaurant" },
      { property: "og:description", content: "Internal management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
  errorComponent: () => (
    <div className="p-16 text-center">Something went wrong. Please refresh.</div>
  ),
  notFoundComponent: () => <div className="p-16 text-center">Not found</div>,
});

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "menu", label: "Menu" },
  { id: "reservations", label: "Reservations" },
  { id: "catering", label: "Catering" },
  { id: "branches", label: "Branches" },
] as const;

function AdminPage() {
  const auth = useAdminAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");

  if (auth.loading) {
    return <div className="p-16 text-center text-muted-foreground">Loading…</div>;
  }

  if (!auth.userId) {
    return <AdminLogin onDone={auth.refresh} />;
  }

  if (!auth.isStaff) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">No access</h1>
        <p className="mt-2 text-muted-foreground">
          {auth.email} is not a staff account. Ask the owner to grant access.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            auth.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {auth.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            auth.refresh();
          }}
        >
          Sign out
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              tab === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && <OrdersPanel />}
        {tab === "menu" && <MenuPanel />}
        {tab === "reservations" && <RequestsPanel kind="reservations" />}
        {tab === "catering" && <RequestsPanel kind="catering_requests" />}
        {tab === "branches" && <BranchesPanel />}
      </div>
    </div>
  );
}
