-- Table: public.images

-- DROP TABLE IF EXISTS public.images;

CREATE TABLE IF NOT EXISTS public.images
(
    id integer NOT NULL DEFAULT nextval('images_id_seq'::regclass),
    organization_id integer NOT NULL,
    workspace_id integer NOT NULL,
    user_id character varying COLLATE pg_catalog."default" NOT NULL,
    filename character varying COLLATE pg_catalog."default" NOT NULL,
    original_name character varying COLLATE pg_catalog."default",
    folder_id integer,
    data text COLLATE pg_catalog."default" NOT NULL,
    file_type character varying COLLATE pg_catalog."default" NOT NULL,
    file_size integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT images_pkey PRIMARY KEY (id),
    CONSTRAINT images_folder_id_folders_id_fk FOREIGN KEY (folder_id)
        REFERENCES public.folders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT images_organization_id_organizations_id_fk FOREIGN KEY (organization_id)
        REFERENCES public.organizations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT images_user_id_users_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT images_workspace_id_workspaces_id_fk FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.images
    OWNER to postgres;
-- Index: images_org_workspace_idx

-- DROP INDEX IF EXISTS public.images_org_workspace_idx;

CREATE INDEX IF NOT EXISTS images_org_workspace_idx
    ON public.images USING btree
    (organization_id ASC NULLS LAST, workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: images_user_idx

-- DROP INDEX IF EXISTS public.images_user_idx;

CREATE INDEX IF NOT EXISTS images_user_idx
    ON public.images USING btree
    (user_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: images_workspace_idx

-- DROP INDEX IF EXISTS public.images_workspace_idx;

CREATE INDEX IF NOT EXISTS images_workspace_idx
    ON public.images USING btree
    (workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: images_workspace_user_idx

-- DROP INDEX IF EXISTS public.images_workspace_user_idx;

CREATE INDEX IF NOT EXISTS images_workspace_user_idx
    ON public.images USING btree
    (workspace_id ASC NULLS LAST, user_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;