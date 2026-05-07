import Link from "next/link";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { UNREAD_BADGE_MAX } from "@/lib/app-config";

export function MobileHeader({
  brandName,
  logoUrl,
  brandInitial,
  totalUnread,
  activePath,
}: {
  brandName: string;
  logoUrl: string | null;
  brandInitial: string;
  totalUnread: number;
  activePath: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-black/[0.08] bg-white px-4 py-3 lg:hidden">
      {/* Brand identity */}
      <div className="flex items-center gap-2.5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Brand logo" className="h-8 w-8 rounded-xl object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-coral to-violet text-xs font-bold text-white">
            {brandInitial}
          </div>
        )}
        <p className="text-sm font-bold text-ink">{brandName}</p>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1">
        <Link
          href="/matches"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-ink/50 transition hover:bg-black/[0.05] hover:text-ink"
          aria-label="Messages"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {totalUnread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
              {totalUnread > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : totalUnread}
            </span>
          ) : null}
        </Link>

        {activePath !== "/settings" ? (
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink/50 transition hover:bg-black/[0.05] hover:text-ink"
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </Link>
        ) : null}

        <SignOutButton />
      </div>
    </header>
  );
}
