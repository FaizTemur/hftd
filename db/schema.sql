create extension if not exists pgcrypto;
create table if not exists registrations(
 id uuid primary key default gen_random_uuid(),
 reg_no int unique,
 full_name text not null, email text not null, phone text not null,
 screenshot_path text not null,
 otp_hash text, otp_expires timestamptz, otp_attempts int not null default 0, otp_sent_at timestamptz,
 verified_at timestamptz,
 status text not null default 'pending_verification' check (status in ('pending_verification','payment_pending_review','approved','rejected')),
 payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected')),
 admin_notes text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create unique index if not exists reg_email_u on registrations(lower(email));
create unique index if not exists reg_phone_u on registrations(phone);
create table if not exists admins(username text primary key, password_hash text not null);
create table if not exists login_attempts(ip text not null, at timestamptz not null default now());
