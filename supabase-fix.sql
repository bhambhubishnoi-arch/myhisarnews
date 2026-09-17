-- ============================================================
-- MyHisarNews FINAL DATABASE SECURITY FIX
-- ============================================================

begin;

-- ============================================================
-- 1. PUBLIC PUBLISHED ARTICLES
-- Works for both anonymous + authenticated visitors
-- ============================================================

drop policy if exists "Public can read published articles"
on public.articles;

create policy "Public can read published articles"
on public.articles
for select
to public
using (
  status = 'published'
);


-- ============================================================
-- 2. PUBLIC ACTIVE ADVERTISEMENTS
-- Works for both anonymous + authenticated visitors
-- ============================================================

drop policy if exists "Public can read active advertisements"
on public.advertisements;

create policy "Public can read active advertisements"
on public.advertisements
for select
to public
using (
  is_active = true
);


-- ============================================================
-- 3. ADMIN CHECK FUNCTION
-- profiles.id = auth.uid()
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'Admin'
  );
$$;

grant execute on function public.is_admin()
to authenticated;


-- ============================================================
-- 4. STAFF MANAGEMENT — SELECT
-- Admin sees all staff.
-- Normal users see only themselves.
-- ============================================================

drop policy if exists "Users can read own profile"
on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin()
);


-- ============================================================
-- 5. STAFF MANAGEMENT — UPDATE
-- Admin can change staff roles.
-- ============================================================

drop policy if exists "Users can update own profile"
on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);


-- ============================================================
-- 6. ATOMIC ARTICLE VIEW COUNTER
-- articles.id = bigint
-- articles.views = bigint
-- ============================================================

create or replace function public.increment_article_views(
  article_id bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_views bigint;
begin

  update public.articles
  set views = coalesce(views, 0) + 1
  where id = article_id
    and status = 'published'
  returning views into new_views;

  return coalesce(new_views, 0);

end;
$$;

grant execute on function public.increment_article_views(bigint)
to anon, authenticated;


-- ============================================================
-- 7. FUNCTION SECURITY
-- Don't allow public role to execute admin helper.
-- ============================================================

revoke execute on function public.is_admin()
from anon;

commit;

-- ============================================================
-- END
-- ============================================================
