import { englishLabel } from "@/lib/english";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const input = "w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm";
export function PasswordSettings() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8 || password.length > 72) return void toast.error("Password must be 8–72 characters");
    if (password !== confirmation) return void toast.error("Passwords do not match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password, current_password: current });
      if (error) throw error;
      setCurrent(""); setPassword(""); setConfirmation("");
      toast.success("Password changed successfully");
    } catch (error) { toast.error(error instanceof Error ? englishLabel(error.message) : "Unable to change password"); }
    finally { setBusy(false); }
  }
  return <section className="p-6 md:p-8"><h1 className="border-b border-border pb-5 text-xl font-medium">Change Password</h1><form onSubmit={submit} className="mt-7 max-w-md space-y-5">
    <label className="block space-y-2 text-sm"><span>Current password</span><input className={input} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
    <label className="block space-y-2 text-sm"><span>New password</span><input className={input} type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    <label className="block space-y-2 text-sm"><span>Confirm new password</span><input className={input} type="password" autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
    <Button disabled={busy} type="submit">{busy ? "Saving…" : "Save"}</Button>
  </form></section>;
}

export function NotificationSettings({ user }: { user: User }) {
  const existing = user.user_metadata?.["notification_preferences"];
  const [preferences, setPreferences] = useState({ orders: existing?.orders !== false, promotions: existing?.promotions === true });
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { notification_preferences: preferences } });
    setBusy(false);
    if (error) return void toast.error(englishLabel(error.message));
    toast.success("Notification settings saved");
  }
  return <section className="p-6 md:p-8"><h1 className="border-b border-border pb-5 text-xl font-medium">Notification Settings</h1>
    <div className="mt-4 divide-y divide-border">
      <div className="flex items-center justify-between gap-4 py-5"><label htmlFor="order-notifications" className="text-sm">Order updates by email</label><Switch id="order-notifications" checked={preferences.orders} onCheckedChange={(orders) => setPreferences({ ...preferences, orders })} /></div>
      <div className="flex items-center justify-between gap-4 py-5"><label htmlFor="promotion-notifications" className="text-sm">Promotions by email</label><Switch id="promotion-notifications" checked={preferences.promotions} onCheckedChange={(promotions) => setPreferences({ ...preferences, promotions })} /></div>
    </div><Button onClick={save} disabled={busy} className="mt-4">{busy ? "Saving…" : "Save"}</Button>
  </section>;
}