import { englishLabel } from "@/lib/english";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/Shop";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useStore } from "@/lib/store";

const safePath = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined }),
  head: () => ({
    meta: [
      { title: "Sign In or Register — KEYSHOP" },
      { name: "description", content: "Sign in or create a KEYSHOP account to save your cart, addresses, and orders." },
      { property: "og:title", content: "Sign In or Register — KEYSHOP" },
      { property: "og:description", content: "Sign in or create a KEYSHOP account to save your cart, addresses, and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must contain at least 8 characters").max(72),
  name: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safePath(redirect);
  const navigate = useNavigate();
  const { user } = useStore();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target as "/", replace: true });
  }, [user, target, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("A password reset link has been sent to your email.");
        return;
      }
      const parsed = schema.safeParse(form);
      if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin + target, data: { full_name: parsed.data.name ?? "" } },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm your account, then sign in.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? englishLabel(err.message) : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Unable to sign in with Google");
  }

  const input = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm";
  return (
    <PageShell>
      <div className="container-shop flex justify-center py-14">
        <div className="w-full max-w-sm rounded-sm border border-border p-6">
          <h1 className="text-xl font-bold">{mode === "up" ? "Create Account" : mode === "forgot" ? "Forgot Password" : "Sign In"}</h1>
          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "up" && <input className={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            <input className={input} type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {mode !== "forgot" && <input className={input} type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
            <button disabled={busy} className="w-full rounded-sm bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {mode === "up" ? "Register" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
            </button>
          </form>
          {mode !== "forgot" && (
            <button onClick={google} className="mt-3 w-full rounded-sm border border-border py-2.5 text-sm font-medium hover:bg-muted">Continue with Google</button>
          )}
          <div className="mt-4 space-y-1 text-center text-xs text-muted-foreground">
            {mode === "in" && (
              <>
                <p>Don't have an account? <button className="text-primary underline" onClick={() => setMode("up")}>Register</button></p>
                <p><button className="underline" onClick={() => setMode("forgot")}>Forgot password?</button></p>
              </>
            )}
            {mode !== "in" && <p><button className="text-primary underline" onClick={() => setMode("in")}>Back to Sign In</button></p>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
