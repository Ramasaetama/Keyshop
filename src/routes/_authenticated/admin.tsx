import { englishLabel } from "@/lib/english";
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, Package, ClipboardList, Users, FileBarChart, ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { checkAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => { if (!await checkAdmin()) throw redirect({ to: "/account" }); },
  head: () => ({ meta: [
    { title: "Admin — KEYSHOP" },
    { name: "description", content: "KEYSHOP admin dashboard: sales, orders, customers, catalog and reports." },
    { property: "og:title", content: "Admin — KEYSHOP" },
    { property: "og:description", content: "KEYSHOP admin dashboard: sales, orders, customers, catalog and reports." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  errorComponent: ({ error }) => <div role="alert" className="p-8"><p>{error instanceof Error ? englishLabel(error.message) : "Unable to load dashboard"}</p><Button asChild variant="link"><Link to="/account">Back to account</Link></Button></div>,
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Order", icon: ClipboardList },
  { to: "/admin/users", label: "User", icon: Users },
  { to: "/admin/products", label: "Products & Stock", icon: Package },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
] as const;

function AdminLayout() {
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function logout() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const current = NAV.find((n) => ("exact" in n ? path === n.to || path === "/admin/" : path.startsWith(n.to)));
  const nav = <>
    <div className="flex items-center justify-between border-b px-6 py-6"><Link to="/" className="text-xl font-bold">KEY<span className="text-primary">SHOP</span></Link><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Close admin menu" onClick={() => setDrawer(false)}><X /></Button></div>
    <p className="px-6 pb-3 pt-7 text-[11px] font-semibold uppercase text-muted-foreground">Store Management</p>
    <nav className="space-y-1 px-3">{NAV.map((n) => <Button asChild key={n.to} variant="ghost" className={`h-11 w-full justify-start px-4 ${current?.to === n.to ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><Link to={n.to} onClick={() => setDrawer(false)}><n.icon />{n.label}</Link></Button>)}</nav>
    <div className="mt-auto space-y-2 border-t p-4"><Button asChild variant="ghost" className="w-full justify-start"><Link to="/"><ArrowUpRight />View Store</Link></Button><Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setConfirm(true)}><LogOut />Log Out</Button></div>
  </>;
  return <div className="min-h-screen bg-muted/60">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-background lg:flex">{nav}</aside>
    {drawer && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawer(false)} /><aside role="dialog" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-60 flex-col bg-background">{nav}</aside></div>}
    <div className="lg:ml-60">
      <header className="flex min-h-20 items-center justify-between gap-3 border-b bg-background px-4 sm:px-8"><div className="flex items-center gap-3"><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Open admin menu" onClick={() => setDrawer(true)}><Menu /></Button><p className="text-sm text-muted-foreground">Admin <span className="mx-2">/</span><span className="font-medium text-foreground">{current?.label ?? "Dashboard"}</span></p></div><Button asChild variant="outline" size="sm"><Link to="/account">My Account</Link></Button></header>
      <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8"><Outlet /></main>
    </div>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Log out of admin?</AlertDialogTitle><AlertDialogDescription>Your admin session will end and you will return to the sign-in page.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={logout}>Log Out</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-xs font-medium text-primary">KEYSHOP ADMIN</p><h1 className="text-2xl font-semibold">{title}</h1></div>{children}</div>;
}
