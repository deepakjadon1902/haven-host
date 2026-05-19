
-- Roles enum + table (separate from profiles for security)
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

create policy "users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Saved hotels (wishlist)
create table public.saved_hotels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hotel_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, hotel_slug)
);

alter table public.saved_hotels enable row level security;

create policy "saved hotels viewable by owner"
  on public.saved_hotels for select to authenticated using (auth.uid() = user_id);
create policy "saved hotels insertable by owner"
  on public.saved_hotels for insert to authenticated with check (auth.uid() = user_id);
create policy "saved hotels deletable by owner"
  on public.saved_hotels for delete to authenticated using (auth.uid() = user_id);

-- Bookings
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reference text not null unique default ('MN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  hotel_slug text not null,
  hotel_name text not null,
  room_type_id text not null,
  room_type_name text not null,
  check_in date not null,
  check_out date not null,
  nights integer not null check (nights > 0),
  adults integer not null check (adults > 0),
  children integer not null default 0,
  guest_full_name text not null,
  guest_email text not null,
  guest_phone text not null,
  pets_allowed boolean not null default false,
  subtotal_cents bigint not null check (subtotal_cents >= 0),
  taxes_cents bigint not null default 0 check (taxes_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  currency text not null default 'INR',
  status public.booking_status not null default 'confirmed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_id_idx on public.bookings (user_id, created_at desc);

alter table public.bookings enable row level security;

create policy "bookings viewable by owner"
  on public.bookings for select to authenticated using (auth.uid() = user_id);
create policy "bookings insertable by owner"
  on public.bookings for insert to authenticated with check (auth.uid() = user_id);
create policy "bookings updatable by owner"
  on public.bookings for update to authenticated using (auth.uid() = user_id);

create trigger bookings_touch
before update on public.bookings
for each row execute function public.touch_updated_at();
