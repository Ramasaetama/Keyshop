import { englishLabel } from "@/lib/english";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/Shop";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — KEYSHOP" },
      { name: "description", content: "Create a new password for your KEYSHOP account." },
      { property: "og:title", content: "Reset Password — KEYSHOP" },
      { property: "og:description", content: "Create a new password for your KEYSHOP account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("Password must contain at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return void toast.error(englishLabel(error.message));
    toast.success("Password updated");
    navigate({ to: "/account" });
  }
  return (
    <PageShell>
      <form onSubmit={submit} className="container-shop mx-auto max-w-sm space-y-3 py-14">
        <h1 className="text-xl font-bold">New Password</h1>
        <input type="password" className="w-full rounded-sm border border-input px-3 py-2 text-sm" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className="w-full rounded-sm bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Save</button>
      </form>
    </PageShell>
  );
}
