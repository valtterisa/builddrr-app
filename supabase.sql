create table public.domains (
  id uuid not null default gen_random_uuid (),
  domain text not null,
  website_environment_id uuid not null,
  is_primary boolean null default false,
  is_verified boolean null default false,
  verification_method text null,
  verification_token text null,
  dns_records jsonb null,
  created_at timestamp with time zone null default now(),
  constraint domains_pkey primary key (id),
  constraint domains_domain_key unique (domain),
  constraint domains_website_environment_id_fkey foreign KEY (website_environment_id) references website_environments (id) on delete CASCADE
) TABLESPACE pg_default;
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);
create table memberships (
  user_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'billing', 'editor', 'viewer')),
  invited_at timestamp with time zone,
  joined_at timestamp with time zone,
  status text not null default 'active' check (status in ('pending', 'active', 'removed')),
  primary key (user_id, team_id)
);
create table websites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  source_code_url text,
  created_at timestamp with time zone default now()
);
create table website_environments (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  type text not null check (type in ('production', 'preview')),
  branch text,
  last_deployed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique (website_id, type)  -- one prod & one preview per site
);
create table domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  website_environment_id uuid not null references website_environments(id) on delete cascade,
  is_primary boolean default false,
  is_verified boolean default false,
  verification_method text,         -- e.g. 'dns', 'http'
  verification_token text,
  dns_records jsonb,                -- CNAME, A, etc.
  created_at timestamp with time zone default now()
);
create table website_subscriptions (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id) on delete cascade,
  plan_tier text not null check (plan_tier in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  price_monthly numeric,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  next_billing_date timestamp with time zone,
  created_at timestamp with time zone default now()
);
create table invoices (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  billing_period_start timestamp with time zone,
  billing_period_end timestamp with time zone,
  total_amount numeric,
  currency text default 'EUR',
  created_at timestamp with time zone default now()
);
create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  website_id uuid references websites(id) on delete set null,
  plan_tier text,
  amount numeric
);
create table pending_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  team_id uuid not null references teams(id) on delete cascade,
  role text not null check (role in ('admin', 'billing', 'editor', 'viewer')),
  invited_at timestamp with time zone default now(),
  invited_by uuid references profiles(id),
  token text unique,  -- optional: for magic invite links
  status text default 'pending' check (status in ('pending', 'accepted', 'expired'))
);
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
  new_team_id uuid;
  full_name text;
  invitation record;
begin
  user_email := new.email;

  -- Create a profile (default behavior)
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now());

  -- Check for pending invitation
  select * into invitation
  from public.pending_invitations
  where lower(email) = lower(user_email) and status = 'pending'
  limit 1;

  if found then
    -- Mark invitation as accepted
    update public.pending_invitations
    set status = 'accepted'
    where id = invitation.id;

    -- Add to invited team
    insert into public.memberships (user_id, team_id, role, status, joined_at)
    values (new.id, invitation.team_id, invitation.role, 'active', now());
  else
    -- No invite: create a personal team
    insert into public.teams (name)
    values (initcap(split_part(user_email, '@', 1)) || '''s Team')
    returning id into new_team_id;

    insert into public.memberships (user_id, team_id, role, status, joined_at)
    values (new.id, new_team_id, 'owner', 'active', now());

    insert into public.websites (team_id, name)
    values (new_team_id, 'My Website');
  end if;

  return new;
end;
$$ language plpgsql security definer;
CREATE POLICY "Allow read for team members"
ON memberships
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM memberships WHERE user_id = auth.uid() AND status = 'active'
  )
);
-- Allow access to profiles of members in the same teams
CREATE POLICY "Allow read of team member profiles"
ON profiles
FOR SELECT
USING (
  id IN (
    SELECT user_id FROM memberships
    WHERE team_id IN (
      SELECT team_id FROM memberships WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
CREATE POLICY "Allow read for team admins or owners"
ON pending_invitations
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM memberships
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role IN ('owner', 'admin')
  )
);
CREATE POLICY "Allow update for team admins or owners"
ON pending_invitations
FOR UPDATE
USING (
  team_id IN (
    SELECT team_id FROM memberships
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role IN ('owner', 'admin')
  )
);
CREATE POLICY "Allow delete for team admins or owners"
ON pending_invitations
FOR DELETE
USING (
  team_id IN (
    SELECT team_id FROM memberships
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND role IN ('owner', 'admin')
  )
);

