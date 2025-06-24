-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Create enum for user roles
create type user_role as enum ('admin', 'editor', 'viewer');

-- Create tables
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.translation_keys (
  id uuid primary key default uuid_generate_v4(),
  key text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translation_keys_key_unique unique (key)
);

create index idx_translation_keys_key on public.translation_keys(key);
create index idx_translation_keys_category on public.translation_keys(category);

create table public.languages (
  code text primary key,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint languages_code_check check (char_length(code) = 2)
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

create index idx_translations_key_id on public.translations(key_id);
create index idx_translations_language_code on public.translations(language_code);

create table public.project_translation_keys (
  project_id uuid not null references public.projects(id) on delete cascade,
  key_id uuid not null references public.translation_keys(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, key_id)
);

-- Enable Row Level Security
alter table public.projects enable row level security;
alter table public.translation_keys enable row level security;
alter table public.translations enable row level security;
alter table public.languages enable row level security;
alter table public.project_translation_keys enable row level security;

-- Create functions for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_projects_updated_at
before update on public.projects
for each row execute function update_updated_at_column();

create trigger update_translation_keys_updated_at
before update on public.translation_keys
for each row execute function update_updated_at_column();

create trigger update_translations_updated_at
before update on public.translations
for each row execute function update_updated_at_column();

create trigger update_languages_updated_at
before update on public.languages
for each row execute function update_updated_at_column();

-- Insert default languages
insert into public.languages (code, name, is_active) values
  ('en', 'English', true),
  ('es', 'Spanish', true),
  ('fr', 'French', true),
  ('de', 'German', true),
  ('zh', 'Chinese', true),
  ('ja', 'Japanese', true)
on conflict (code) do nothing;
