import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Pencil, UserRound } from "lucide-react";
import { PageShell } from "@/components/shop/Shop";
import { useStore } from "@/lib/store";
import { useAccountName, type AccountSection } from "@/lib/account";

const sections: { key: AccountSection; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "payments", label: "Banks & Cards" },
  { key: "addresses", label: "Addresses" },
  { key: "password", label: "Change Password" },
  { key: "notifications", label: "Notification Settings" },
];

export function AccountLayout({ active, children }: { active: AccountSection | "orders"; children: ReactNode }) {
  const { user } = useStore();
  const name = useAccountName(user);
  return (
    <PageShell>
      <div className="min-h-[620px] bg-muted py-8 md:py-10">
        <div className="container-shop grid items-start gap-6 md:grid-cols-[210px_minmax(0,1fr)] lg:gap-8">
          <aside className="min-w-0" aria-label="Account menu">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">{name.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold">{name}</p>
                <Link to="/account" search={{ section: "profile" }} className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><Pencil className="size-3" /> Edit Profile</Link>
              </div>
            </div>
            <nav className="space-y-4 text-sm">
              <div>
                <Link to="/account" search={{ section: "profile" }} className="flex items-center gap-2 font-medium"><UserRound className="size-5 text-primary" />My Account</Link>
                <ul className="mt-3 grid grid-cols-2 gap-3 pl-7 md:grid-cols-1">
                  {sections.map((section) => <li key={section.key}><Link to="/account" search={{ section: section.key }} aria-current={active === section.key ? "page" : undefined} className={`block text-[13px] hover:text-primary ${active === section.key ? "font-medium text-primary" : "text-muted-foreground"}`}>{section.label}</Link></li>)}
                </ul>
              </div>
              <Link to="/orders" search={{ tab: "all" }} aria-current={active === "orders" ? "page" : undefined} className={`flex items-center gap-2 font-medium ${active === "orders" ? "text-primary" : "text-foreground"}`}><ClipboardList className="size-5 text-primary" />My Orders</Link>
            </nav>
          </aside>
          <main className="min-w-0 bg-background" aria-label={active === "orders" ? "My Orders" : "My Account"}>{children}</main>
        </div>
      </div>
    </PageShell>
  );
}