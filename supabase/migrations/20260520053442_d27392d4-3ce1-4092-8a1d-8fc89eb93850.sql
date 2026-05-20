
-- 1. hotel_settings (single row)
create table public.hotel_settings (
  id boolean primary key default true check (id = true),
  name text not null default 'MaisonNoir',
  tagline text not null default 'A sanctuary of quiet luxury',
  city text not null default 'Vrindavan',
  country text not null default 'India',
  address text not null default 'Parikrama Marg, Vrindavan, Mathura, India',
  description text not null default 'MaisonNoir blends contemporary comfort with timeless hospitality, offering hand-crafted rooms tucked away from the everyday.',
  hero_image text not null default 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80',
  contact_email text not null default 'stay@maisonnoir.com',
  contact_phone text not null default '+91 99999 99999',
  updated_at timestamptz not null default now()
);
alter table public.hotel_settings enable row level security;
create policy "hotel_settings public read" on public.hotel_settings for select using (true);
create policy "hotel_settings admin update" on public.hotel_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger hotel_settings_touch before update on public.hotel_settings for each row execute function public.touch_updated_at();

insert into public.hotel_settings (id) values (true) on conflict (id) do nothing;

-- 2. rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_per_night_cents bigint not null default 500000,
  max_adults int not null default 2,
  max_children int not null default 0,
  pets_allowed boolean not null default false,
  size text,
  bed_type text,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  cover_image text,
  total_units int not null default 1,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rooms enable row level security;
create policy "rooms public read active" on public.rooms for select using (active = true or public.has_role(auth.uid(),'admin'));
create policy "rooms admin insert" on public.rooms for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "rooms admin update" on public.rooms for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "rooms admin delete" on public.rooms for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger rooms_touch before update on public.rooms for each row execute function public.touch_updated_at();

-- 3. room_inventory
create table public.room_inventory (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  date date not null,
  status text not null check (status in ('closed','maintenance')),
  note text,
  created_at timestamptz not null default now(),
  unique (room_id, date)
);
create index room_inventory_room_date_idx on public.room_inventory(room_id, date);
alter table public.room_inventory enable row level security;
create policy "inventory public read" on public.room_inventory for select using (true);
create policy "inventory admin insert" on public.room_inventory for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "inventory admin update" on public.room_inventory for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "inventory admin delete" on public.room_inventory for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- 4. bookings: add room_id + admin policies
alter table public.bookings add column if not exists room_id uuid references public.rooms(id) on delete set null;
create index if not exists bookings_room_id_idx on public.bookings(room_id);
create index if not exists bookings_dates_idx on public.bookings(check_in, check_out);

create policy "bookings admin view all" on public.bookings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "bookings admin update all" on public.bookings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "bookings admin delete" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- 5. promote specific email to admin on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  if lower(new.email) = 'deepakjadon1907@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
      on conflict (user_id, role) do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
      on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

-- Ensure trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill: if the admin account already exists, grant admin role
insert into public.user_roles (user_id, role)
select u.id, 'admin'::app_role
from auth.users u
where lower(u.email) = 'deepakjadon1907@gmail.com'
on conflict (user_id, role) do nothing;

-- 6. storage bucket for room images
insert into storage.buckets (id, name, public) values ('room-images', 'room-images', true)
on conflict (id) do nothing;

create policy "room-images public read"
on storage.objects for select
using (bucket_id = 'room-images');

create policy "room-images admin insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'room-images' and public.has_role(auth.uid(),'admin'));

create policy "room-images admin update"
on storage.objects for update to authenticated
using (bucket_id = 'room-images' and public.has_role(auth.uid(),'admin'));

create policy "room-images admin delete"
on storage.objects for delete to authenticated
using (bucket_id = 'room-images' and public.has_role(auth.uid(),'admin'));

-- 7. seed starter rooms
insert into public.rooms (slug, name, description, price_per_night_cents, max_adults, max_children, pets_allowed, size, bed_type, amenities, images, cover_image, total_units, sort_order)
values
('double-bed-ac', 'Double Bed AC', 'A refined corner suite with king bed, marble bath, and a juliet balcony overlooking the inner courtyard.', 420000, 3, 2, true, '38 m²', '1 King bed',
  array['King bed','Climate control','Smart TV','Rain shower','Tea & coffee'],
  array['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'],
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80',
  6, 1),
('triple-bed-ac', 'Triple Bed AC', 'Spacious family suite with a separate lounge area and panoramic windows facing the temple skyline.', 640000, 4, 3, false, '54 m²', '3 single beds',
  array['3 single beds','Lounge area','Smart TV','Bathtub','Mini bar'],
  array['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80'],
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
  4, 2),
('garden-villa', 'Garden Villa', 'Standalone villa with a private garden, plunge pool and outdoor shower — the quietest stay on property.', 1250000, 2, 2, true, '88 m²', '1 King bed',
  array['Plunge pool','Private garden','Outdoor shower','Butler service','Champagne bar'],
  array['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1600&q=80'],
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  2, 3)
on conflict (slug) do nothing;
