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

-- Add human-friendly name to preview environments while keeping app_name for routing
ALTER TABLE public.preview_environments
ADD COLUMN IF NOT EXISTS name TEXT;

COMMENT ON COLUMN public.preview_environments.name IS 'Descriptive display name for the preview environment (separate from app_name)';

-- AI Usage Limits Migration
-- This migration adds tables and functionality to track AI usage based on subscription plans

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('chat', 'content_generation', 'code_generation', 'image_generation')),
    tokens_used INTEGER DEFAULT 0,
    requests_count INTEGER DEFAULT 1,
    cost_usd DECIMAL(10,4) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI usage limits table based on plans
CREATE TABLE IF NOT EXISTS public.ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name TEXT NOT NULL UNIQUE CHECK (plan_name IN ('starter', 'pro', 'enterprise')),
    monthly_chat_requests INTEGER NOT NULL DEFAULT 0,
    monthly_content_generation_requests INTEGER NOT NULL DEFAULT 0,
    monthly_code_generation_requests INTEGER NOT NULL DEFAULT 0,
    monthly_image_generation_requests INTEGER NOT NULL DEFAULT 0,
    monthly_token_limit INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plan limits
INSERT INTO public.ai_usage_limits (plan_name, monthly_chat_requests, monthly_content_generation_requests, monthly_code_generation_requests, monthly_image_generation_requests, monthly_token_limit) VALUES
    ('starter', 50, 20, 10, 5, 100000),
    ('pro', 500, 200, 100, 50, 1000000),
    ('enterprise', -1, -1, -1, -1, -1) -- -1 means unlimited
ON CONFLICT (plan_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS ai_usage_user_id_idx ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_website_id_idx ON public.ai_usage(website_id);
CREATE INDEX IF NOT EXISTS ai_usage_created_at_idx ON public.ai_usage(created_at);
CREATE INDEX IF NOT EXISTS ai_usage_type_idx ON public.ai_usage(usage_type);

-- Enable RLS on new tables
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_usage
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
ON public.ai_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage"
ON public.ai_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for ai_usage_limits (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view AI usage limits"
ON public.ai_usage_limits FOR SELECT
USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp for ai_usage
CREATE OR REPLACE FUNCTION update_ai_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_usage_updated_at
    BEFORE UPDATE ON public.ai_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_usage_updated_at();

-- Create function to get current month usage for a user
CREATE OR REPLACE FUNCTION get_user_monthly_ai_usage(user_uuid UUID)
RETURNS TABLE (
    usage_type TEXT,
    total_requests INTEGER,
    total_tokens INTEGER,
    total_cost DECIMAL(10,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.usage_type,
        SUM(au.requests_count) as total_requests,
        SUM(au.tokens_used) as total_tokens,
        SUM(au.cost_usd) as total_cost
    FROM public.ai_usage au
    WHERE au.user_id = user_uuid
    AND au.created_at >= date_trunc('month', CURRENT_DATE)
    GROUP BY au.usage_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has exceeded limits
CREATE OR REPLACE FUNCTION check_ai_usage_limits(user_uuid UUID)
RETURNS TABLE (
    plan_name TEXT,
    usage_type TEXT,
    current_usage INTEGER,
    limit_value INTEGER,
    is_exceeded BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_plan AS (
        SELECT p.plan
        FROM public.profiles p
        WHERE p.id = user_uuid
    ),
    current_usage AS (
        SELECT 
            au.usage_type,
            SUM(au.requests_count) as total_requests
        FROM public.ai_usage au
        WHERE au.user_id = user_uuid
        AND au.created_at >= date_trunc('month', CURRENT_DATE)
        GROUP BY au.usage_type
    ),
    limits AS (
        SELECT 
            aul.plan_name,
            aul.monthly_chat_requests,
            aul.monthly_content_generation_requests,
            aul.monthly_code_generation_requests,
            aul.monthly_image_generation_requests
        FROM public.ai_usage_limits aul
        JOIN user_plan up ON aul.plan_name = up.plan
    )
    SELECT 
        l.plan_name,
        'chat' as usage_type,
        COALESCE(cu.total_requests, 0) as current_usage,
        l.monthly_chat_requests as limit_value,
        CASE 
            WHEN l.monthly_chat_requests = -1 THEN false
            ELSE COALESCE(cu.total_requests, 0) >= l.monthly_chat_requests
        END as is_exceeded
    FROM limits l
    LEFT JOIN current_usage cu ON cu.usage_type = 'chat'
    
    UNION ALL
    
    SELECT 
        l.plan_name,
        'content_generation' as usage_type,
        COALESCE(cu.total_requests, 0) as current_usage,
        l.monthly_content_generation_requests as limit_value,
        CASE 
            WHEN l.monthly_content_generation_requests = -1 THEN false
            ELSE COALESCE(cu.total_usage, 0) >= l.monthly_content_generation_requests
        END as is_exceeded
    FROM limits l
    LEFT JOIN current_usage cu ON cu.usage_type = 'content_generation'
    
    UNION ALL
    
    SELECT 
        l.plan_name,
        'code_generation' as usage_type,
        COALESCE(cu.total_requests, 0) as current_usage,
        l.monthly_code_generation_requests as limit_value,
        CASE 
            WHEN l.monthly_code_generation_requests = -1 THEN false
            ELSE COALESCE(cu.total_usage, 0) >= l.monthly_code_generation_requests
        END as is_exceeded
    FROM limits l
    LEFT JOIN current_usage cu ON cu.usage_type = 'code_generation'
    
    UNION ALL
    
    SELECT 
        l.plan_name,
        'image_generation' as usage_type,
        COALESCE(cu.total_requests, 0) as current_usage,
        l.monthly_image_generation_requests as limit_value,
        CASE 
            WHEN l.monthly_image_generation_requests = -1 THEN false
            ELSE COALESCE(cu.total_usage, 0) >= l.monthly_image_generation_requests
        END as is_exceeded
    FROM limits l
    LEFT JOIN current_usage cu ON cu.usage_type = 'image_generation';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

