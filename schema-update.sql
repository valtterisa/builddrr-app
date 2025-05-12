-- Add subscription_interval column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_interval TEXT;

-- Add missing fields to websites table
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS machine_id TEXT;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'creating';
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS last_deployed TIMESTAMP WITH TIME ZONE;

-- Create index for websites.machine_id
CREATE INDEX IF NOT EXISTS websites_machine_id_idx ON public.websites(machine_id);
CREATE INDEX IF NOT EXISTS websites_status_idx ON public.websites(status);

-- Update existing websites that might have null machine_id
UPDATE public.websites SET status = 'creating' WHERE status IS NULL;

-- Output message
DO $$ 
BEGIN
    RAISE NOTICE 'Schema update completed. Added machine_id, status, url, and last_deployed fields to websites table.';
END $$;

-- Add app_name field to websites table
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS app_name TEXT;

-- Update any existing records to populate the app_name field if possible
UPDATE public.websites 
SET app_name = CONCAT(name, '-', SUBSTRING(user_id::text, 1, 5), '-', SUBSTRING(created_at::text, 1, 10))
WHERE app_name IS NULL AND machine_id IS NOT NULL;

-- Comment explaining purpose of update
COMMENT ON COLUMN public.websites.app_name IS 'The Fly.io app name associated with this website';

