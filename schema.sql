-- SQL Schema for Thapar StudentOS (Campus Spots review database)

-- 1. Profiles Table (Holds authenticated user records)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles"
  on public.profiles for select
  using (true);

create policy "Allow individual insert/update access to profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Allow individual update access to profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Spots Table
create table public.spots (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null check (category in ('food', 'study', 'chill')),
  description text not null,
  busy_times text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Spots
alter table public.spots enable row level security;

create policy "Allow public read access to spots"
  on public.spots for select
  using (true);

create policy "Allow authenticated users to suggest spots"
  on public.spots for insert
  with check (auth.role() = 'authenticated');


-- 3. Reviews Table (Enforces 1 review per student per spot)
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  studyable integer not null check (studyable >= 1 and studyable <= 5),
  couples integer not null check (couples >= 1 and couples <= 5),
  food integer not null check (food >= 1 and food <= 5),
  hangout integer not null check (hangout >= 1 and hangout <= 5),
  strictness integer not null check (strictness >= 1 and strictness <= 5),
  isolation integer not null check (isolation >= 1 and isolation <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Constraint to restrict duplicate reviews
  constraint unique_user_spot unique (user_id, spot_id)
);

-- Enable RLS for Reviews
alter table public.reviews enable row level security;

create policy "Allow public read access to reviews"
  on public.reviews for select
  using (true);

create policy "Allow authenticated users to insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Allow users to delete or update their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);


-- Seed default campus locations
insert into public.spots (name, category, description, busy_times) values
('Jaggi Fountain Plaza', 'food', 'The social hub of Thapar. Incredible variety of street food, cafes, and open seating.', '5:00 PM - 8:00 PM'),
('Central Library (LTS)', 'study', 'Nava Nalanda Library / Learning Center. Ultra-quiet zones, study cubicles, and full AC.', '10:00 AM - 5:00 PM'),
('Nirvana Cafeteria (Cosmos)', 'chill', 'Cafeteria next to Hostels. Good coffee, pool tables, and indoor seating.', '4:00 PM - 7:00 PM')
on conflict do nothing;
