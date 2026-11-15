
-- =====================================================
-- STREETGO CYBER
-- Migration 001: Merchant and Device Foundation
-- =====================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------
-- 1. CYBER MERCHANTS
-- -----------------------------------------------------

create table if not exists public.cyber_merchants (
    id uuid primary key default gen_random_uuid(),

    owner_user_id uuid not null
        references auth.users(id) on delete restrict,

    business_name text not null,
    business_phone text,
    business_email text,
    business_registration_number text,

    status text not null default 'pending'
        check (status in (
            'pending',
            'under_review',
            'active',
            'suspended',
            'rejected'
        )),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (owner_user_id, business_name)
);

create index if not exists idx_cyber_merchants_owner
    on public.cyber_merchants(owner_user_id);


-- -----------------------------------------------------
-- 2. CYBER BRANCHES
-- -----------------------------------------------------

create table if not exists public.cyber_branches (
    id uuid primary key default gen_random_uuid(),

    merchant_id uuid not null
        references public.cyber_merchants(id) on delete restrict,

    branch_name text not null,
    address text,
    city text,
    contact_phone text,

    status text not null default 'active'
        check (status in ('active', 'inactive')),

    created_at timestamptz not null default now(),

    unique (merchant_id, branch_name),
    unique (id, merchant_id)
);

create index if not exists idx_cyber_branches_merchant
    on public.cyber_branches(merchant_id);


-- -----------------------------------------------------
-- 3. CYBER COMPUTERS
-- -----------------------------------------------------

create table if not exists public.cyber_computers (
    id uuid primary key default gen_random_uuid(),

    merchant_id uuid not null,
    branch_id uuid not null,

    computer_name text not null,
    device_status text not null default 'pending'
        check (device_status in (
            'pending',
            'online',
            'offline',
            'suspended',
            'revoked'
        )),

    operating_system text,
    last_seen_at timestamptz,

    created_at timestamptz not null default now(),

    foreign key (branch_id, merchant_id)
        references public.cyber_branches(id, merchant_id)
        on delete restrict,

    unique (branch_id, computer_name),
    unique (id, merchant_id)
);

create index if not exists idx_cyber_computers_merchant
    on public.cyber_computers(merchant_id);

create index if not exists idx_cyber_computers_branch
    on public.cyber_computers(branch_id);


-- -----------------------------------------------------
-- 4. CYBER DEVICES
-- Device credentials are server-managed.
-- Never expose credential hashes to browser clients.
-- -----------------------------------------------------

create table if not exists public.cyber_devices (
    id uuid primary key default gen_random_uuid(),

    computer_id uuid not null unique,
    merchant_id uuid not null,

    credential_hash text not null,

    last_heartbeat_at timestamptz,
    revoked_at timestamptz,

    created_at timestamptz not null default now(),

    foreign key (computer_id, merchant_id)
        references public.cyber_computers(id, merchant_id)
        on delete restrict
);

create index if not exists idx_cyber_devices_computer
    on public.cyber_devices(computer_id);


-- -----------------------------------------------------
-- 5. TEMPORARY PAIRING CODES
-- Only trusted server-side services may access these.
-- Store hashes, never raw pairing codes.
-- -----------------------------------------------------

create table if not exists public.cyber_pairing_codes (
    id uuid primary key default gen_random_uuid(),

    merchant_id uuid not null,
    computer_id uuid not null,

    code_hash text not null unique,

    expires_at timestamptz not null,
    used_at timestamptz,
    revoked_at timestamptz,

    created_at timestamptz not null default now(),

    foreign key (computer_id, merchant_id)
        references public.cyber_computers(id, merchant_id)
        on delete restrict
);

create index if not exists idx_cyber_pairing_codes_expiry
    on public.cyber_pairing_codes(expires_at);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.cyber_merchants enable row level security;
alter table public.cyber_branches enable row level security;
alter table public.cyber_computers enable row level security;
alter table public.cyber_devices enable row level security;
alter table public.cyber_pairing_codes enable row level security;


-- -----------------------------------------------------
-- MERCHANT POLICIES
-- -----------------------------------------------------

create policy "Owners can view their cyber merchants"
on public.cyber_merchants
for select
to authenticated
using (owner_user_id = (select auth.uid()));

create policy "Users can register cyber merchants"
on public.cyber_merchants
for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "Owners can update their cyber merchants"
on public.cyber_merchants
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));


-- -----------------------------------------------------
-- BRANCH POLICIES
-- -----------------------------------------------------

create policy "Owners can view their branches"
on public.cyber_branches
for select
to authenticated
using (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_branches.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
);

create policy "Owners can create their branches"
on public.cyber_branches
for insert
to authenticated
with check (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_branches.merchant_id
          and m.owner_user_id = (select auth.uid())
          and m.status = 'active'
    )
);

create policy "Owners can update their branches"
on public.cyber_branches
for update
to authenticated
using (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_branches.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_branches.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
);


-- -----------------------------------------------------
-- COMPUTER POLICIES
-- -----------------------------------------------------

create policy "Owners can view their computers"
on public.cyber_computers
for select
to authenticated
using (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_computers.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
);

create policy "Owners can register computers"
on public.cyber_computers
for insert
to authenticated
with check (
    device_status = 'pending'
    and exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_computers.merchant_id
          and m.owner_user_id = (select auth.uid())
          and m.status = 'active'
    )
);

create policy "Owners can update their computers"
on public.cyber_computers
for update
to authenticated
using (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_computers.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.cyber_merchants m
        where m.id = cyber_computers.merchant_id
          and m.owner_user_id = (select auth.uid())
    )
);


-- -----------------------------------------------------
-- DEVICE AND PAIRING TABLES
-- Intentionally no browser-facing policies.
-- Trusted server-side services use the service role.
-- -----------------------------------------------------


-- =====================================================
-- END OF MIGRATION 001
-- =====================================================
