
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default",
    username text COLLATE pg_catalog."default",
    password text COLLATE pg_catalog."default",
    first_name character varying COLLATE pg_catalog."default",
    last_name character varying COLLATE pg_catalog."default",
    profile_image_url character varying COLLATE pg_catalog."default",
    auth_provider character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'local'::character varying,
    provider_id character varying COLLATE pg_catalog."default",
    last_auth_method character varying COLLATE pg_catalog."default",
    current_organization_id integer,
    current_workspace_id integer,
    last_workspace_id integer,
    credits integer NOT NULL DEFAULT 0,
    subscription_plan character varying COLLATE pg_catalog."default",
    subscription_status character varying COLLATE pg_catalog."default" DEFAULT 'inactive'::character varying,
    subscription_expires_at timestamp without time zone,
    bio text COLLATE pg_catalog."default",
    timezone character varying COLLATE pg_catalog."default" DEFAULT 'UTC'::character varying,
    language character varying COLLATE pg_catalog."default" DEFAULT 'en'::character varying,
    reset_token character varying COLLATE pg_catalog."default",
    reset_token_expiry timestamp without time zone,
    verification_token character varying COLLATE pg_catalog."default",
    verification_token_expiry timestamp without time zone,
    company_name character varying COLLATE pg_catalog."default",
    company_logo_url character varying COLLATE pg_catalog."default",
    company_website character varying COLLATE pg_catalog."default",
    company_industry character varying COLLATE pg_catalog."default",
    company_size character varying COLLATE pg_catalog."default",
    onboarding_completed boolean DEFAULT false,
    interested_platforms text[] COLLATE pg_catalog."default",
    primary_goals text[] COLLATE pg_catalog."default",
    user_role character varying COLLATE pg_catalog."default" DEFAULT 'creator'::character varying,
    account_status character varying COLLATE pg_catalog."default" DEFAULT 'active'::character varying,
    email_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_current_organization_id_organizations_id_fk FOREIGN KEY (current_organization_id)
        REFERENCES public.organizations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT users_current_workspace_id_workspaces_id_fk FOREIGN KEY (current_workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT users_last_workspace_id_workspaces_id_fk FOREIGN KEY (last_workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;