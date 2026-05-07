import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-4 py-16 text-center">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-violet/[0.08] blur-[130px]" />
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-coral/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-teal/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
            i
          </div>
          <span className="font-sans text-lg font-semibold tracking-tight text-light/80">iTender</span>
        </Link>

        {/* 404 */}
        <p className="font-display text-[9rem] font-bold leading-none tracking-tight sm:text-[12rem]">
          <span className="bg-gradient-to-r from-coral via-violet to-teal bg-clip-text text-transparent">
            404
          </span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-semibold text-light sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-light/45">
          The page you&apos;re looking for has been moved or never existed.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-light/70 transition hover:border-white/20 hover:text-light"
          >
            ← Go home
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-gradient-to-r from-coral to-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90 active:scale-95"
          >
            Sign in →
          </Link>
        </div>
      </div>
    </main>
  );
}
