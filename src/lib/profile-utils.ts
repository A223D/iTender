type ProfileShape = { logo_url: string | null; website_url: string | null };

export function isProfileIncomplete(profile: ProfileShape): boolean {
  return !profile.logo_url || !profile.website_url;
}

export function profileNudgeText(profile: ProfileShape): string {
  if (!profile.logo_url && !profile.website_url) {
    return "Add a logo and website so creators trust your brand.";
  }
  if (!profile.logo_url) return "Add a logo so creators recognise your brand.";
  return "Add your website so creators can learn more.";
}
