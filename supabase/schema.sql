-- Fresh installations. For an existing database use email-auth-migration.sql.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_storage (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key)
);

alter table public.profiles enable row level security;
alter table public.user_storage enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users can read their own data" on public.user_storage for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own data" on public.user_storage for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own data" on public.user_storage for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, email) values (new.id, lower(new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();
