-- Table: public.generated_content

-- DROP TABLE IF EXISTS public.generated_content;

CREATE TABLE IF NOT EXISTS public.generated_content
(
    id integer NOT NULL DEFAULT nextval('generated_content_id_seq'::regclass),
    workspace_id integer NOT NULL,
    post_id integer NOT NULL,
    title character varying COLLATE pg_catalog."default",
    body text COLLATE pg_catalog."default",
    image_url character varying COLLATE pg_catalog."default",
    image_prompt text COLLATE pg_catalog."default",
    platform_content jsonb,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT generated_content_pkey PRIMARY KEY (id),
    CONSTRAINT generated_content_post_id_posts_id_fk FOREIGN KEY (post_id)
        REFERENCES public.posts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT generated_content_workspace_id_workspaces_id_fk FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.generated_content
    OWNER to postgres;
-- Index: generated_content_post_idx

-- DROP INDEX IF EXISTS public.generated_content_post_idx;

CREATE INDEX IF NOT EXISTS generated_content_post_idx
    ON public.generated_content USING btree
    (post_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: generated_content_workspace_idx

-- DROP INDEX IF EXISTS public.generated_content_workspace_idx;

CREATE INDEX IF NOT EXISTS generated_content_workspace_idx
    ON public.generated_content USING btree
    (workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: generated_content_workspace_post_idx

-- DROP INDEX IF EXISTS public.generated_content_workspace_post_idx;

CREATE INDEX IF NOT EXISTS generated_content_workspace_post_idx
    ON public.generated_content USING btree
    (workspace_id ASC NULLS LAST, post_id ASC NULLS LAST)
    TABLESPACE pg_default;