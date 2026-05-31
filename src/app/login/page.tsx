"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { BgStack } from "@/components/ui/bg-stack";
import { upsertBusinessUser, postAuthRedirect } from "@/lib/user-auth";

type Step = "method" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("method");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleSendCode() {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: trimmed });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setDigits(["", "", "", "", "", ""]);
    setStep("otp");
    setTimeout(() => digitRefs.current[0]?.focus(), 50);
  }

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      const next = [...digits];
      for (let i = 0; i < 6 && i < cleaned.length; i++) {
        next[index + i] = cleaned[i] ?? "";
      }
      const trimmed = next.slice(0, 6);
      setDigits(trimmed);
      const focusAt = Math.min(index + cleaned.length, 5);
      digitRefs.current[focusAt]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (digits.every((d) => d !== "")) handleVerify();
      return;
    }
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        digitRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify() {
    setError(null);
    const token = digits.join("");
    if (token.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    if (verifyError || !data.user) {
      setLoading(false);
      setError(verifyError?.message ?? "Invalid or expired code. Try resending.");
      return;
    }

    const user = data.user;
    const { hasProfile } = await upsertBusinessUser(supabase, user);

    if (!hasProfile) {
      fetch("/api/send-welcome", { method: "POST" }).catch(() => {});
    }

    router.push(postAuthRedirect(hasProfile));
  }

  async function handleResend() {
    setError(null);
    setDigits(["", "", "", "", "", ""]);
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    });
    setLoading(false);
    if (otpError) setError(otpError.message);
    else setTimeout(() => digitRefs.current[0]?.focus(), 50);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <BgStack />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Scout logo" width={32} height={32} className="dark:invert" />
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-text)]">Scout for Business</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Connect with creators and grow your brand</p>
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-ambient p-8" style={{ borderRadius: 24 }}>
          {step === "method" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Welcome</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Sign in to manage your campaigns and find the right creators for your brand.
              </p>

              {/* Email */}
              <div className="mt-8 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="input-recessed w-full text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || !email.trim()}
                  className="w-full rounded-2xl bg-[var(--color-text)] px-5 py-3.5 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send code →"}
                </button>
              </div>

              {error ? (
                <p className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}

              <p className="mt-6 text-center text-xs text-[var(--color-text-hint)]">
                New to Scout?{" "}
                <span className="text-[var(--color-text-muted)]">Signing in will create your account automatically.</span>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setStep("method"); setError(null); }}
                className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
              >
                ← Back
              </button>

              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Check your email</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-[var(--color-text)]">{email.trim().toLowerCase()}</span>.
              </p>

              {/* 6-digit boxes */}
              <div className="mt-8 flex justify-between gap-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="input-recessed h-14 w-full text-center text-xl font-bold"
                    style={{ padding: "0" }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || digits.join("").length < 6}
                className="mt-6 w-full rounded-2xl bg-[var(--color-text)] px-5 py-3.5 text-sm font-bold text-[var(--color-on-text)] transition hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify →"}
              </button>

              {error ? (
                <p className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}

              <p className="mt-5 text-center text-sm text-[var(--color-text-hint)]">
                Didn&apos;t get it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-semibold text-[var(--color-text-muted)] underline underline-offset-2 transition hover:text-[var(--color-text)] disabled:opacity-40"
                >
                  Resend code
                </button>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-hint)]">
          Looking to collaborate as a creator?{" "}
          <a
            href="https://apps.apple.com/app/scout"
            className="font-medium text-[var(--color-text-muted)] underline underline-offset-2 transition hover:text-[var(--color-text)]"
          >
            Download the Scout app
          </a>
        </p>
      </div>
    </main>
  );
}
