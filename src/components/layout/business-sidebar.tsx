import Link from "next/link";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { UnreadBadge } from "@/components/ui/unread-badge";
import { isProfileIncomplete, profileNudgeText } from "@/lib/profile-utils";
import { logoInitial } from "@/lib/formatters";

type NavLinkProps = {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function NavLink({ href, active, icon, children }: NavLinkProps) {
  const base = "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition";
  const styles = active
    ? `${base} glass text-[var(--color-text)]`
    : `${base} text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-[var(--color-text)]`;
  return (
    <Link href={href} className={styles}>
      {icon}
      {children}
    </Link>
  );
}

const icons = {
  campaigns: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  messages: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

export function BusinessSidebar({
  activePath,
  totalUnread,
  profile,
}: {
  activePath: string;
  totalUnread: number;
  profile: { brand_name: string; logo_url: string | null; website_url: string | null };
}) {
  const incomplete = isProfileIncomplete(profile);
  const initial = logoInitial(profile.brand_name);

  return (
    <aside className="glass relative hidden w-[240px] shrink-0 flex-col overflow-hidden rounded-none border-t-0 border-b-0 border-l-0 border-r border-r-white/10 lg:flex">
      <div className="relative z-10 flex h-full flex-col">
        {/* Wordmark */}
        <div className="px-5 pb-4 pt-6">
          <div className="inline-flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
              <path
                d="M14 4L16.5 11.5L24 14L16.5 16.5L14 24L11.5 16.5L4 14L11.5 11.5L14 4Z"
                fill="currentColor"
                strokeWidth="1.2"
                strokeOpacity="0.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-bold italic tracking-tight text-[var(--color-text)]">Scout</span>
          </div>
        </div>

        {/* Brand identity card */}
        <div className="mx-3 rounded-[14px] glass p-4">
          {profile.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo_url} alt="Brand logo" className="h-11 w-11 rounded-xl object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl glass text-sm font-bold text-[var(--color-text)]">
              {initial}
            </div>
          )}
          <p className="mt-3 text-sm font-bold leading-tight text-[var(--color-text)]">{profile.brand_name}</p>
          <p className="text-xs text-[var(--color-text-hint)]">Business Account</p>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-0.5 px-3">
          <NavLink href="/dashboard" active={activePath === "/dashboard"} icon={icons.campaigns}>
            Campaigns
          </NavLink>
          <NavLink href="/matches" active={activePath === "/matches"} icon={icons.messages}>
            Messages
            <UnreadBadge count={totalUnread} className="ml-auto" />
          </NavLink>
          <NavLink href="/settings" active={activePath === "/settings"} icon={icons.settings}>
            Settings
          </NavLink>
        </nav>

        {/* Incomplete profile nudge */}
        {incomplete ? (
          <Link
            href="/onboarding/business"
            className="mx-3 mb-3 block rounded-[14px] glass border border-error/30 px-4 py-3 transition hover:opacity-80"
          >
            <p className="text-xs font-semibold text-error">Complete your profile</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{profileNudgeText(profile)}</p>
          </Link>
        ) : null}

        {/* Sign out */}
        <div className="px-4 pb-6">
          <SignOutButton className="w-full rounded-xl glass px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]" />
        </div>
      </div>
    </aside>
  );
}
