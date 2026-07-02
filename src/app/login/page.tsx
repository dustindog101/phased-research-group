"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else if (result?.ok) {
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <section className="py-16 min-h-[60vh]">
      <div className="prg-container max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-[32px] font-bold uppercase tracking-[3px] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign In
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            Access your account and order history
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.2)] rounded-[var(--prg-radius)] text-sm text-[var(--prg-danger)]">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--prg-text-muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--prg-accent)] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
