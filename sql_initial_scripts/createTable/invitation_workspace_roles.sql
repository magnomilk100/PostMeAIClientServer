-- Table: public.invitation_workspace_roles

-- DROP TABLE IF EXISTS public.invitation_workspace_roles;

CREATE TABLE IF NOT EXISTS public.invitation_workspace_roles
(
    id integer NOT NULL DEFAULT nextval('invitation_workspace_roles_id_seq'::regclass),
    invitation_id integer NOT NULL,
    workspace_id integer NOT NULL,
    roles text[] COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT invitation_workspace_roles_pkey PRIMARY KEY (id),
    CONSTRAINT invitation_workspace_roles_invitation_id_workspace_id_unique UNIQUE (invitation_id, workspace_id),
    CONSTRAINT invitation_workspace_roles_invitation_id_user_invitations_id_fk FOREIGN KEY (invitation_id)
        REFERENCES public.user_invitations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT invitation_workspace_roles_workspace_id_workspaces_id_fk FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invitation_workspace_roles
    OWNER to postgres;
-- Index: invitation_workspace_roles_invitation_idx

-- DROP INDEX IF EXISTS public.invitation_workspace_roles_invitation_idx;

CREATE INDEX IF NOT EXISTS invitation_workspace_roles_invitation_idx
    ON public.invitation_workspace_roles USING btree
    (invitation_id ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: invitation_workspace_roles_workspace_idx

-- DROP INDEX IF EXISTS public.invitation_workspace_roles_workspace_idx;

CREATE INDEX IF NOT EXISTS invitation_workspace_roles_workspace_idx
    ON public.invitation_workspace_roles USING btree
    (workspace_id ASC NULLS LAST)
    TABLESPACE pg_default;