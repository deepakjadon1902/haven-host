## Scope (one big pass)

Three things in one go: (1) rebrand hotels → rooms for a single property "MaisonNoir", (2) flip the entire UI from black-on-gold to white-on-black-on-white (pure white bg / pure black text, gold accent kept), (3) ship a fully functional admin panel for `deepakjadon1907@gmail.com`.

## Database

New migration:

- `hotel_settings` — single-row table for MaisonNoir's name, tagline, city, address, hero image, contact info. Public read.
- `rooms` — room types (slug, name, description, price_cents, max_adults/children, pets_allowed, size, bed_type, amenities[], images[], cover_image, total_units, active). Public read of active rows; admin-only write.
- `room_inventory` — per `(room_id, date)` block with status `closed | maintenance`. Public read; admin-only write. Booked dates are derived from `bookings`.
- `bookings` — add `room_id uuid` (nullable for legacy rows). Admin gets full SELECT/UPDATE/DELETE via `has_role(uid, 'admin')` policies.
- `handle_new_user` trigger: if `new.email = 'deepakjadon1907@gmail.com'`, insert role `'admin'` in `user_roles` instead of `'user'`. Backfill: insert admin role for that user if already exists.
- Storage bucket `room-images` (public read, admin write) for uploads.
- Seed `hotel_settings` row and 3 starter rooms so the site isn't empty.

## Theme (src/styles.css)

- `--background: oklch(1 0 0)` (pure white), `--foreground: oklch(0 0 0)` (pure black).
- Invert surface/card/muted to subtle off-whites; borders to soft black at low alpha.
- Keep `--gold` and `--gold-light` as primary accent.
- Rewrite `.glass`, `.hero-radial`, `.gold-text` for light surfaces.
- Remove every hardcoded `text-white`, `bg-black`, `bg-white/…` in components — swap for semantic tokens (`text-foreground`, `bg-background`, `border-border`, `text-muted-foreground`).

## Public site (rebrand)

- Routes renamed conceptually: `/hotels` → `/rooms`, `/hotels/$hotelId` → `/rooms/$roomSlug`. Old files deleted.
- `src/data/hotels.ts` deleted; replaced by `src/lib/rooms.functions.ts` (server fn list/get rooms with availability) consumed by route loaders.
- Navbar, footer, home hero, about, contact, gallery, offers, FAQ — all reworded to single-hotel "MaisonNoir" with rooms terminology.
- Booking flow updates: pick a room → date range → guest details → confirm. Availability check uses `room_inventory` + existing `bookings`.
- Sitemap regenerated from DB rooms.

## Admin panel `/admin/*` (under `_authenticated`, gated by `has_role admin`)

- New layout `src/routes/_authenticated/admin.tsx` with role guard (redirects non-admins to `/account`) + sidebar nav.
- `/admin` — dashboard: occupancy %, revenue (last 30d), upcoming check-ins, total bookings cards + simple bar chart.
- `/admin/rooms` — table of rooms, create/edit/delete dialog, image upload to `room-images` bucket, toggle active, set total_units.
- `/admin/calendar` — month grid per room: click a date to toggle closed/maintenance/open. Booked dates shown read-only.
- `/admin/bookings` — searchable/filterable table (by status, date, guest), view detail drawer, cancel booking.
- `/admin/settings` — edit hotel_settings.

## Technical (TanStack)

- All admin mutations go through `createServerFn` files (`src/lib/admin-rooms.functions.ts`, `admin-bookings.functions.ts`, `admin-inventory.functions.ts`, `admin-settings.functions.ts`) protected by `requireSupabaseAuth` + `has_role admin` check inside the handler.
- Public reads (`/rooms`, `/rooms/$slug`) use server fns with `supabaseAdmin` scoped by `active = true` (so prerender works without a session).
- File uploads via browser client to storage bucket; admin write policy enforces role.
- Add `useAdmin()` hook that reads role from `user_roles` for nav visibility.

## Deliverable summary for non-technical preview

- One hotel ("MaisonNoir") with multiple room types you manage from an admin panel.
- Site flips to a clean white background with black text and gold accent.
- Sign in as `deepakjadon1907@gmail.com` → "Admin" link appears in the navbar → manage rooms, block dates, see bookings, dashboard stats.

Confirm and I'll start with the migration, then ship the rest in one pass.
