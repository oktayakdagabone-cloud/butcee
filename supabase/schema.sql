create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  security_question text not null,
  security_answer_hash text not null,
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
create policy "Users can update their own data" on public.user_storage for update to authenticated using (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, security_question, security_answer_hash)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'security_question', 'Güvenlik sorusu'),
    extensions.crypt(lower(trim(coalesce(new.raw_user_meta_data->>'security_answer', ''))), extensions.gen_salt('bf'))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

create or replace function public.get_security_question(p_email text)
returns text language sql security definer set search_path = public as $$
  select security_question from public.profiles where email = lower(trim(p_email)) limit 1;
$$;

create or replace function public.verify_security_answer(p_email text, p_answer text)
returns boolean language sql security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles
    where email = lower(trim(p_email))
      and security_answer_hash = extensions.crypt(lower(trim(p_answer)), security_answer_hash)
  );
$$;

revoke all on function public.get_security_question(text) from public;
revoke all on function public.verify_security_answer(text, text) from public;
grant execute on function public.get_security_question(text) to anon, authenticated;
grant execute on function public.verify_security_answer(text, text) to anon, authenticated;
