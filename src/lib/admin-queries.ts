import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_ORDER_SELECT } from "./admin-orders";

/** Single order source for Dashboard, Order, User and Laporan pages. RLS limits all-order reads to admins. */
export const adminOrdersQuery = queryOptions({
  queryKey: ["admin-orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("shop_orders").select(ADMIN_ORDER_SELECT).order("order_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
export type AdminOrder = Awaited<ReturnType<typeof adminOrdersQuery.queryFn & {}>>[number];

export const adminProfilesQuery = queryOptions({
  queryKey: ["admin-profiles"],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("id, full_name, email, phone, created_at").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
