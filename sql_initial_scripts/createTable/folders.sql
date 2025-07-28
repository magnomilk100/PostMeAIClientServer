-- SEQUENCE: public.folders_id_seq

-- DROP SEQUENCE IF EXISTS public.folders_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.folders_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.folders_id_seq
    OWNED BY public.folders.id;

ALTER SEQUENCE public.folders_id_seq
    OWNER TO uqoqjnk938llc;

-- Table: public.folders

-- DROP TABLE IF EXISTS public.folders;

CREATE TABLE IF NOT EXISTS public.folders
(
    id integer NOT NULL DEFAULT nextval('folders_id_seq'::regclass),
    organization_id integer NOT NULL,
    workspace_id integer NOT NULL,
    user_id character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT folders_pkey PRIMARY KEY (id),
    CONSTRAINT folders_workspace_id_user_id_name_unique UNIQUE (workspace_id, user_id, name),
    CONSTRAINT folders_organization_id_organizations_id_fk FOREIGN KEY (organization_id)
        REFERENCES public.organizations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT folders_user_id_users_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT folders_workspace_id_workspaces_id_fk FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.folders
    OWNER to uqoqjnk938llc;
-- Index: folders_org_workspace_idx

-- DROP INDEX IF EXISTS public.folders_org_workspace_idx;

CREATE INDEX IF NOT EXISTS folders_org_workspace_idx
    ON public.folders USING btree
    (organization_id ASC NULLS LAST, workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: folders_user_idx

-- DROP INDEX IF EXISTS public.folders_user_idx;

CREATE INDEX IF NOT EXISTS folders_user_idx
    ON public.folders USING btree
    (user_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: folders_workspace_idx

-- DROP INDEX IF EXISTS public.folders_workspace_idx;

CREATE INDEX IF NOT EXISTS folders_workspace_idx
    ON public.folders USING btree
    (workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: folders_workspace_user_idx

-- DROP INDEX IF EXISTS public.folders_workspace_user_idx;

CREATE INDEX IF NOT EXISTS folders_workspace_user_idx
    ON public.folders USING btree
    (workspace_id ASC NULLS LAST, user_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;