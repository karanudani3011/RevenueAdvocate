-- ====================================================================
-- SUPABASE DATABASE SETUP FOR REVENUE ADVOCATE (LEXJURIS CHAMBERS)
-- ====================================================================
-- This script sets up a public profiles table linked to the Supabase Auth system,
-- configures Row Level Security (RLS) policies, and creates a storage bucket for licence images.
-- Copy and run this script inside the SQL Editor of your Supabase project.

-- 1. CREATE PROFILES TABLE
-- This table stores additional profile information for users who sign up.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone_number text,
  licence_image_url text,
  role text not null default 'Advocate',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for security
alter table public.profiles enable row level security;

-- 2. CREATE ROW LEVEL SECURITY (RLS) POLICIES FOR PROFILES
-- Users can view their own profile
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile details
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile details
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 3. STORAGE SETUP FOR LICENCE IMAGES
-- Create a public bucket for licence images if it doesn't already exist.
-- Note: You can also create this bucket named "licences" manually from the Storage menu in the Supabase Dashboard.
insert into storage.buckets (id, name, public)
values ('licences', 'licences', true)
on conflict (id) do nothing;

-- 4. STORAGE POLICIES
-- Policy to allow public viewing of uploaded licence images
create policy "Licence images are publicly viewable"
  on storage.objects for select
  using ( bucket_id = 'licences' );

-- Policy to allow authenticated users to upload files to the licences bucket
create policy "Users can upload their own licence image"
  on storage.objects for insert
  with check (
    bucket_id = 'licences' 
    and auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to update or delete their files
create policy "Users can update their own licence image"
  on storage.objects for update
  with check (
    bucket_id = 'licences'
    and auth.role() = 'authenticated'
  );

create policy "Users can delete their own licence image"
  on storage.objects for delete
  using (
    bucket_id = 'licences'
    and auth.role() = 'authenticated'
  );
