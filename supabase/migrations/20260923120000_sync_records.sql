-- Per-record cloud sync for ARISE.
--
-- One row per synced record: the client pushes what changed since its last push and pulls what
-- changed since its last pull, so two devices merge instead of overwriting each other.
-- updated_at is the client's millisecond timestamp, which is also the sync cursor.

CREATE TABLE IF NOT EXISTS public.sync_records (
    user_id    UUID REFERENCES auth.users NOT NULL,
    table_name TEXT NOT NULL,
    uid        TEXT NOT NULL,
    updated_at BIGINT NOT NULL,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    data       JSONB,
    PRIMARY KEY (user_id, table_name, uid)
);

-- The pull query: everything of mine newer than my cursor.
CREATE INDEX IF NOT EXISTS sync_records_user_updated_idx
    ON public.sync_records (user_id, updated_at);

ALTER TABLE public.sync_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read their own records.' AND tablename = 'sync_records') THEN
        CREATE POLICY "Users read their own records." ON public.sync_records
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert their own records.' AND tablename = 'sync_records') THEN
        CREATE POLICY "Users insert their own records." ON public.sync_records
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update their own records.' AND tablename = 'sync_records') THEN
        CREATE POLICY "Users update their own records." ON public.sync_records
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete their own records.' AND tablename = 'sync_records') THEN
        CREATE POLICY "Users delete their own records." ON public.sync_records
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- A device that has been offline can push stale copies; never let one overwrite a newer record.
CREATE OR REPLACE FUNCTION public.sync_records_keep_newest()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.updated_at < OLD.updated_at THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_records_keep_newest_trigger ON public.sync_records;
CREATE TRIGGER sync_records_keep_newest_trigger
    BEFORE UPDATE ON public.sync_records
    FOR EACH ROW EXECUTE FUNCTION public.sync_records_keep_newest();
