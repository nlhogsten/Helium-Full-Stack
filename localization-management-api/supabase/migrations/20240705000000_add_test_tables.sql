-- Create test tables with the same structure as production but with _test suffix

-- Test translation keys table
create table public.translation_keys_test (
  id uuid primary key default uuid_generate_v4(),
  key text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translation_keys_test_key_unique unique (key)
);

-- Test languages table
create table public.languages_test (
  code text primary key,
  name text not null,
  is_active boolean not null default true
);

-- Test translations table
create table public.translations_test (
  id uuid primary key default uuid_generate_v4(),
  key_id uuid not null references public.translation_keys_test(id) on delete cascade,
  language_code text not null references public.languages_test(code) on delete cascade,
  value text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translations_test_key_language_unique unique (key_id, language_code)
);

-- Enable Row Level Security on test tables (but don't add any policies)
alter table public.translation_keys_test enable row level security;
alter table public.languages_test enable row level security;
alter table public.translations_test enable row level security;

-- Create indexes for better query performance
create index idx_translations_test_key_id on public.translations_test(key_id);
create index idx_translations_test_language_code on public.translations_test(language_code);

-- Add triggers for updated_at on test tables
create trigger update_translation_keys_test_modtime
before update on public.translation_keys_test
for each row execute function update_updated_at_column();

create trigger update_translations_test_modtime
before update on public.translations_test
for each row execute function update_updated_at_column();
