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
    ? `${base} bg-moss/[0.08] text-moss`
    : `${base} text-ink/50 hover:bg-black/[0.04] hover:text-ink`;
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
    <aside className="hidden w-60 shrink-0 flex-col border-r border-black/[0.07] bg-white lg:flex">
      {/* Wordmark */}
      <div className="px-6 pb-5 pt-6">
        <span className="font-display text-base font-bold tracking-tight text-ink">iTender</span>
      </div>

      {/* Brand identity card */}
      <div className="mx-4 rounded-2xl bg-black/[0.03] px-4 py-4">
        {profile.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo_url} alt="Brand logo" className="h-12 w-12 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white">
            {initial}
          </div>
        )}
        <p className="mt-3 text-sm font-bold leading-tight text-ink">{profile.brand_name}</p>
        <p className="text-xs text-ink/40">Business Account</p>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
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
          className="mx-4 mb-4 block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
        >
          <p className="text-xs font-semibold text-amber-700">Complete your profile</p>
          <p className="mt-0.5 text-xs text-amber-600/80">{profileNudgeText(profile)}</p>
        </Link>
      ) : null}

      {/* Sign out */}
      <div className="px-5 pb-6">
        <SignOutButton />
      </div>
    </aside>
  );
}
