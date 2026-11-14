import { englishLabel } from "@/lib/english";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { PasswordSettings, NotificationSettings } from "@/components/shop/AccountSettings";
import { Button } from "@/components/ui/button";
import { parseAccountSection, profileQuery, useAccountName, type AccountSection } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: (s: Record<string, unknown>): { section?: AccountSection } => ({ section: parseAccountSection(s["section"]) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery(context.user.id)),
  errorComponent: () => <p role="alert" className="p-8">Unable to load account.</p>,
  notFoundComponent: () => <p className="p-8">Account not found.</p>,
  head: () => ({
    meta: [
      { title: "My Account — KEYSHOP" },
      { name: "description", content: "Manage your KEYSHOP profile, addresses, and payment methods." },
      { property: "og:title", content: "My Account — KEYSHOP" },
      { property: "og:description", content: "Manage your KEYSHOP profile, addresses, and payment methods." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

const input = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm";
const btn = "rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50";

function AccountPage() {
  const { user } = Route.useRouteContext();
  const search = Route.useSearch();
  const section = search.section ?? "profile";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data ?? false,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AccountLayout active={section}>
      {section === "profile" && <ProfileCard userId={user.id} />}
      {section === "addresses" && <AddressesCard />}
      {section === "payments" && <PaymentsCard />}
      {section === "password" && <PasswordSettings />}
      {section === "notifications" && <NotificationSettings user={user} />}
      <div className="flex justify-end gap-4 border-t border-border px-6 py-4 text-xs">
        {isAdmin && <Link to="/admin" className="text-primary">Admin</Link>}
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">Log Out</Button>
      </div>
    </AccountLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 md:p-8">
      <h1 className="mb-7 border-b border-border pb-5 text-xl font-medium">{title}</h1>
      {children}
    </section>
  );
}

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().regex(/^[0-9+\-\s]{0,20}$/, "Invalid phone number"),
});

function ProfileCard({ userId }: { userId: string }) {
  const { data, refetch } = useSuspenseQuery(profileQuery(userId));
  const { user } = Route.useRouteContext();
  const name = useAccountName(user);
  const [f, setF] = useState({ full_name: "", email: "", phone: "" });
  useEffect(() => { if (data) setF({ full_name: data.full_name, email: data.email, phone: data.phone }); }, [data]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = profileSchema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Invalid details");
    const { error } = await supabase.from("profiles").upsert({ id: userId, ...p.data });
    if (error) return void toast.error(englishLabel(error.message));
    toast.success("Profile saved");
    refetch();
  }
  return (
    <Card title="My Profile">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_180px]">
        <form onSubmit={save} className="max-w-xl space-y-5">
          <label className="grid items-center gap-2 text-sm sm:grid-cols-[110px_1fr]"><span className="text-muted-foreground">Name</span><input className={input} required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
          <label className="grid items-center gap-2 text-sm sm:grid-cols-[110px_1fr]"><span className="text-muted-foreground">Contact email</span><input className={input} type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="grid items-center gap-2 text-sm sm:grid-cols-[110px_1fr]"><span className="text-muted-foreground">Phone number</span><input className={input} type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <div className="sm:pl-[110px]"><Button type="submit">Save</Button></div>
        </form>
        <div className="hidden justify-center border-l border-border pt-2 lg:flex"><span className="flex size-24 items-center justify-center rounded-full bg-primary text-4xl font-medium text-primary-foreground">{name.slice(0, 1).toUpperCase()}</span></div>
      </div>
    </Card>
  );
}

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  recipient: z.string().trim().min(1, "Recipient name is required").max(100),
  street: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(80),
  postal_code: z.string().trim().max(10),
});

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await supabase.from("addresses").select("*").order("created_at")).data ?? [],
  });
}

function AddressesCard() {
  const { data = [], refetch } = useAddresses();
  const empty = { label: "Home", recipient: "", street: "", city: "", postal_code: "" };
  const [f, setF] = useState(empty);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const p = addressSchema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Invalid details");
    const { error } = await supabase.from("addresses").insert({ ...p.data, is_default: data.length === 0 });
    if (error) return void toast.error(englishLabel(error.message));
    setF(empty);
    refetch();
  }
  async function makeDefault(id: string) {
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    refetch();
  }
  async function del(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    refetch();
  }
  return (
    <Card title="Addresses">
      <ul className="space-y-2">
        {data.map((a) => (
          <li key={a.id} className="rounded-sm border border-border p-3 text-sm">
            <p className="font-semibold">{a.label} {a.is_default && <span className="ml-1 rounded-sm bg-primary px-1.5 text-[10px] text-primary-foreground">Default</span>}</p>
            <p className="text-muted-foreground">{a.recipient}, {a.street}, {a.city} {a.postal_code}</p>
            <div className="mt-1 flex gap-3 text-xs">
              {!a.is_default && <Button variant="link" size="sm" className="text-primary" onClick={() => makeDefault(a.id)}>Set as default</Button>}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => del(a.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 space-y-2">
        <input className={input} placeholder="Label (Home/Office)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
        <input className={input} placeholder="Recipient name" value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} />
        <input className={input} placeholder="Street and house number" value={f.street} onChange={(e) => setF({ ...f, street: e.target.value })} />
        <div className="flex gap-2">
          <input className={input} placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <input className={input} placeholder="Postal code" value={f.postal_code} onChange={(e) => setF({ ...f, postal_code: e.target.value })} />
        </div>
        <Button type="submit" className={btn}>Add Address</Button>
      </form>
    </Card>
  );
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => (await supabase.from("payment_methods").select("*, payment_types(name)").order("created_at")).data ?? [],
  });
}

const paySchema = z.object({
  payment_type_id: z.number().int().positive(),
  provider: z.string().trim().min(1, "Provider is required (e.g. BCA, Visa, GoPay)").max(40),
  account_last4: z.string().regex(/^[0-9]{4}$/, "Enter only the last 4 digits"),
  expiry: z.string().trim().max(7),
});

function PaymentsCard() {
  const { data = [], refetch } = usePaymentMethods();
  const { data: types = [] } = useQuery({
    queryKey: ["payment-types"],
    queryFn: async () => (await supabase.from("payment_types").select("*").order("id")).data ?? [],
  });
  const [f, setF] = useState({ payment_type_id: 1, provider: "", account_last4: "", expiry: "" });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const p = paySchema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Invalid details");
    const { error } = await supabase.from("payment_methods").insert({ ...p.data, is_default: data.length === 0 });
    if (error) return void toast.error(englishLabel(error.message));
    setF({ ...f, provider: "", account_last4: "", expiry: "" });
    refetch();
  }
  return (
    <Card title="Banks & Cards">
      <ul className="space-y-2">
        {data.map((m) => (
          <li key={m.id} className="rounded-sm border border-border p-3 text-sm">
            <p className="font-semibold">{englishLabel(m.payment_types?.name)} · {m.provider} {m.is_default && <span className="ml-1 rounded-sm bg-primary px-1.5 text-[10px] text-primary-foreground">Default</span>}</p>
            <p className="text-muted-foreground">•••• {m.account_last4} {m.expiry && `· ${m.expiry}`}</p>
            <div className="mt-1 flex gap-3 text-xs">
              {!m.is_default && <Button variant="link" size="sm" className="text-primary" onClick={async () => { await supabase.from("payment_methods").update({ is_default: true }).eq("id", m.id); refetch(); }}>Set as default</Button>}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={async () => { await supabase.from("payment_methods").delete().eq("id", m.id); refetch(); }}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 space-y-2">
        <select className={input} value={f.payment_type_id} onChange={(e) => setF({ ...f, payment_type_id: Number(e.target.value) })}>
          {types.map((t) => <option key={t.id} value={t.id}>{englishLabel(t.name)}</option>)}
        </select>
        <input className={input} placeholder="Provider (Visa, BCA, GoPay…)" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} />
        <div className="flex gap-2">
          <input className={input} inputMode="numeric" maxLength={4} placeholder="Last 4 digits" value={f.account_last4} onChange={(e) => setF({ ...f, account_last4: e.target.value })} />
          <input className={input} placeholder="MM/YY (optional)" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} />
        </div>
        <p className="text-[11px] text-muted-foreground">For your security, full card numbers are not stored.</p>
        <Button type="submit" className={btn}>Add Method</Button>
      </form>
    </Card>
  );
}
