"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
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
            Create Account
          </h1>
          <p className="text-sm text-[var(--prg-text-muted)]">
            Track orders, save addresses, and checkout faster
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
              Name (optional)
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                placeholder="Your name"
              />
            </div>
          </div>

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
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                placeholder="Min 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--prg-text-muted)]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--prg-text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--prg-accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
