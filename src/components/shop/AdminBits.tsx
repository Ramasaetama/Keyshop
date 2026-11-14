import { paymentLabels, orderStatusLabel, type PaymentStatus } from "@/lib/admin-orders";

export function PaymentBadge({ status }: { status: string }) {
  const tone = status === "paid" ? "bg-brand-green/15 text-foreground" : status === "pending" ? "bg-accent/25 text-accent-foreground" : "bg-destructive/10 text-destructive";
  return <span className={`inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ${tone}`}>{paymentLabels[status as PaymentStatus] ?? status}</span>;
}
export function StatusBadge({ id, name }: { id: number; name?: string | null }) {
  return <span className="inline-flex whitespace-nowrap rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{orderStatusLabel(id, name)}</span>;
}
export const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—");
export const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;
