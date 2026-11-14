import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { displayName, parseAccountSection } from "./account";

const user: User = { id: "test-user", email: "rama@example.com", user_metadata: { full_name: "Rama" }, app_metadata: {}, aud: "authenticated", created_at: "2026-11-04T00:00:00Z" };
describe("Account identity", () => {
  it("shows registered name instead of My Account", () => expect(displayName(user)).toBe("Rama"));
  it("uses the saved profile name after edits", () => expect(displayName(user, "Rama Saetama")).toBe("Rama Saetama"));
  it("shows My Account only for guests", () => expect(displayName(null)).toBe("My Account"));
  it("defaults unknown sections to profile", () => expect(parseAccountSection("voucher")).toBe("profile"));
});