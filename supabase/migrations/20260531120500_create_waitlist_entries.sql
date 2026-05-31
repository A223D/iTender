create extension if not exists pgcrypto with schema extensions;

create table if not exists public.waitlist_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  role text not null,
  instagram_handle text,
  company_name text,
  website_url text,
  source text not null default 'homepage',
  user_agent text,
  constraint waitlist_entries_name_present check (length(btrim(name)) > 0 and length(name) <= 120),
  constraint waitlist_entries_email_valid check (
    email is null or (
      length(email) <= 254
      and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  ),
  constraint waitlist_entries_phone_length check (phone is null or length(phone) <= 40),
  constraint waitlist_entries_role_valid check (role in ('creator', 'brand')),
  constraint waitlist_entries_contact_required check (
    nullif(btrim(coalesce(email, '')), '') is not null
    or nullif(btrim(coalesce(phone, '')), '') is not null
  ),
  constraint waitlist_entries_creator_fields check (
    role <> 'creator'
    or nullif(btrim(coalesce(instagram_handle, '')), '') is not null
  ),
  constraint waitlist_entries_brand_fields check (
    role <> 'brand'
    or nullif(btrim(coalesce(company_name, '')), '') is not null
  ),
  constraint waitlist_entries_company_length check (company_name is null or length(company_name) <= 160),
  constraint waitlist_entries_instagram_length check (instagram_handle is null or length(instagram_handle) <= 80),
  constraint waitlist_entries_website_valid check (
    website_url is null
    or (
      length(website_url) <= 255
      and website_url ~* '^https?://'
    )
  )
);

alter table public.waitlist_entries enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist_entries;
create policy "Anyone can join waitlist"
  on public.waitlist_entries
  for insert
  to anon, authenticated
  with check (true);

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);

create index if not exists waitlist_entries_role_idx
  on public.waitlist_entries (role);

create index if not exists waitlist_entries_email_idx
  on public.waitlist_entries (lower(email))
  where email is not null;
