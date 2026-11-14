import type { User } from "@supabase/supabase-js";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const accountSections = ["profile", "payments", "addresses", "password", "notifications"] as const;
export type AccountSection = (typeof accountSections)[number];
export function parseAccountSection(value: unknown): AccountSection {
  return accountSections.find((section) => section === value) ?? "profile";
}
export function displayName(user: User | null, profileName?: string | null): string {
  return profileName?.trim() || String(user?.user_metadata?.["full_name"] || user?.user_metadata?.["name"] || "").trim() || user?.email?.split("@")[0] || "My Account";
}
export const profileQuery = (userId: string) => queryOptions({
  queryKey: ["profile", userId],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },
});
export function useAccountName(user: User | null) {
  const { data } = useQuery({ ...profileQuery(user?.id ?? ""), enabled: Boolean(user) });
  return displayName(user, data?.full_name);
}