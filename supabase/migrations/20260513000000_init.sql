-- Initial Schema for ARISE Cloud Sync

-- Create the backups table
CREATE TABLE IF NOT EXISTS public.backups (
    user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own backup.' AND tablename = 'backups') THEN
        CREATE POLICY "Users can view their own backup." ON public.backups
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own backup.' AND tablename = 'backups') THEN
        CREATE POLICY "Users can insert their own backup." ON public.backups
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own backup.' AND tablename = 'backups') THEN
        CREATE POLICY "Users can update their own backup." ON public.backups
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
