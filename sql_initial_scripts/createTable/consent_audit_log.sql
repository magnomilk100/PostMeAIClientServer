-- SEQUENCE: public.consent_audit_log_id_seq

-- DROP SEQUENCE IF EXISTS public.consent_audit_log_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.consent_audit_log_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- Table: public.consent_audit_log

-- DROP TABLE IF EXISTS public.consent_audit_log;

CREATE TABLE IF NOT EXISTS public.consent_audit_log
(
    id integer NOT NULL DEFAULT nextval('consent_audit_log_id_seq'::regclass),
    user_id character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    session_id character varying COLLATE pg_catalog."default",
    consent_action character varying COLLATE pg_catalog."default" NOT NULL,
    privacy_policy_accepted boolean NOT NULL,
    terms_of_use_accepted boolean NOT NULL,
    mandatory_cookies boolean NOT NULL DEFAULT true,
    analytics_cookies boolean NOT NULL DEFAULT false,
    personalization_cookies boolean NOT NULL DEFAULT false,
    marketing_cookies boolean NOT NULL DEFAULT false,
    user_agent text COLLATE pg_catalog."default",
    ip_address character varying COLLATE pg_catalog."default",
    consent_timestamp timestamp without time zone DEFAULT now(),
    consent_data jsonb,
    CONSTRAINT consent_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT consent_audit_log_user_id_users_id_fk FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.consent_audit_log
    OWNER to postgres;
-- Index: consent_audit_email_idx

-- DROP INDEX IF EXISTS public.consent_audit_email_idx;

CREATE INDEX IF NOT EXISTS consent_audit_email_idx
    ON public.consent_audit_log USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: consent_audit_session_idx

-- DROP INDEX IF EXISTS public.consent_audit_session_idx;

CREATE INDEX IF NOT EXISTS consent_audit_session_idx
    ON public.consent_audit_log USING btree
    (session_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: consent_audit_timestamp_idx

-- DROP INDEX IF EXISTS public.consent_audit_timestamp_idx;

CREATE INDEX IF NOT EXISTS consent_audit_timestamp_idx
    ON public.consent_audit_log USING btree
    (consent_timestamp ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: consent_audit_user_idx

-- DROP INDEX IF EXISTS public.consent_audit_user_idx;

CREATE INDEX IF NOT EXISTS consent_audit_user_idx
    ON public.consent_audit_log USING btree
    (user_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

ALTER SEQUENCE public.consent_audit_log_id_seq
    OWNED BY public.consent_audit_log.id;

ALTER SEQUENCE public.consent_audit_log_id_seq
    OWNER TO postgres;	