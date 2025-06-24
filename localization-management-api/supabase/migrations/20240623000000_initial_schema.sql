-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Simplified schema based on the requirements
create table public.translation_keys (
  id uuid primary key default uuid_generate_v4(),
  key text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translation_keys_key_unique unique (key)
);

create table public.languages (
  code text primary key,
  name text not null,
  is_active boolean not null default true
);

create table public.translations (
  id uuid primary key default uuid_generate_v4(),
  key_id uuid not null references public.translation_keys(id) on delete cascade,
  language_code text not null references public.languages(code) on delete cascade,
  value text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translations_key_language_unique unique (key_id, language_code)
);

-- Enable Row Level Security
alter table public.translation_keys enable row level security;
alter table public.languages enable row level security;
alter table public.translations enable row level security;

-- Simplified RLS Policies
-- Allow all authenticated users to view languages
create policy "Allow all authenticated users to view languages"
on public.languages
for select
to authenticated
using (true);

-- Allow all authenticated users to view translation keys
create policy "Allow all authenticated users to view translation keys"
on public.translation_keys
for select
to authenticated
using (true);

-- Allow all authenticated users to view translations
create policy "Allow all authenticated users to view translations"
on public.translations
for select
to authenticated
using (true);

-- Functions for automatic timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_translation_keys_modtime
before update on public.translation_keys
for each row execute function update_updated_at_column();

create trigger update_translations_modtime
before update on public.translations
for each row execute function update_updated_at_column();
