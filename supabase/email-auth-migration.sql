-- Email/password registration replaces the retired security-question flow.
-- Existing users and their budget data are preserved.
begin;

alter table public.profiles alter column security_question drop not null;
alter table public.profiles alter column security_answer_hash drop not null;

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, lower(new.email));
  return new;
end;
$$;

-- These RPCs are no longer used; prevent email enumeration and answer guessing.
revoke all on function public.get_security_question(text) from public, anon, authenticated;
revoke all on function public.verify_security_answer(text, text) from public, anon, authenticated;

commit;
