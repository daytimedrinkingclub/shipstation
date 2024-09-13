-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, available_ships)
  VALUES (NEW.id, NEW.email, 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create table
  public.user_profiles (
    id uuid not null,
    available_ships smallint null default 0,
    email text not null,
    updated_at timestamp with time zone null default now(),
    constraint user_profiles_pkey primary key (id),
    constraint user_profiles_email_key unique (email),
    constraint user_profiles_id_fkey foreign key (id) references auth.users (id)
  ) tablespace pg_default;


create table
  public.ships (
    id serial not null,
    user_id uuid null,
    status character varying(20) null,
    prompt text not null,
    execution_time numeric(6, 2) null,
    tokens_used integer null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    slug text null,
    mode text not null default 'internal'::text,
    constraint ships_pkey primary key (id),
    constraint ships_slug_key unique (slug),
    constraint ships_user_id_fkey foreign key (user_id) references auth.users (id),
    constraint ships_status_check check (
      (
        (status)::text = any (
          (
            array[
              'pending'::character varying,
              'generating'::character varying,
              'completed'::character varying,
              'failed'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_ships_user_id on public.ships using btree (user_id) tablespace pg_default;

create trigger update_ships_modtime before
update on ships for each row
execute function update_modified_column ();


create table
  public.conversations (
    id serial not null,
    user_id uuid null,
    tokens_used integer null,
    ship_id integer null,
    created_at timestamp with time zone null default now(),
    constraint conversations_pkey primary key (id),
    constraint conversations_ship_id_fkey foreign key (ship_id) references ships (id),
    constraint conversations_user_id_fkey foreign key (user_id) references auth.users (id)
  ) tablespace pg_default;

create index if not exists idx_conversations_user_id on public.conversations using btree (user_id) tablespace pg_default;


create table
  public.payments (
    id serial not null,
    user_id uuid null,
    payload jsonb not null,
    transaction_id character varying(255) null,
    status character varying(20) null,
    provider character varying(20) null,
    created_at timestamp with time zone null default now(),
    constraint payments_pkey primary key (id),
    constraint payments_user_id_fkey foreign key (user_id) references auth.users (id),
    constraint payments_provider_check check (
      (
        (provider)::text = any (
          (
            array[
              'razorpay'::character varying,
              'stripe'::character varying,
              'manual'::character varying
            ]
          )::text[]
        )
      )
    ),
    constraint payments_status_check check (
      (
        (status)::text = any (
          (
            array[
              'pending'::character varying,
              'failed'::character varying,
              'successful'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_payments_user_id on public.payments using btree (user_id) tablespace pg_default;

-- Commands to create policies for managing user access to tables
-- Policy for conversations table
CREATE POLICY manage_own_conversations
ON public.conversations
FOR ALL
TO public
USING (auth.uid() = user_id);

-- Policy for ships table
CREATE POLICY manage_own_ships
ON public.ships
FOR ALL
TO public
USING (auth.uid() = user_id);

-- Policies for user_profiles table
CREATE POLICY read_own_profile
ON public.user_profiles
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY update_available_ships
ON public.user_profiles
FOR UPDATE
TO public
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');