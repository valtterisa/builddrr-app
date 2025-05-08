-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.assets;
DROP TABLE IF EXISTS public.integrations;
DROP TABLE IF EXISTS public.domains;
DROP TABLE IF EXISTS public.websites;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS machines;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.increment_website_visits(website_id UUID);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise'))
);

-- Create websites table
CREATE TABLE public.websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::JSONB,
    published BOOLEAN DEFAULT FALSE,
    template_id TEXT,
    custom_domain TEXT,
    settings JSONB DEFAULT '{}'::JSONB,
    visits INTEGER DEFAULT 0,
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise'))
);

-- Create domains table
CREATE TABLE public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
    ssl BOOLEAN DEFAULT FALSE,
    dns_records JSONB DEFAULT '{}'::JSONB
);

-- Create integrations table
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'error'))
);

-- Create assets table
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    machine_id TEXT NOT NULL,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'stopped',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, machine_id)
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment website visits
CREATE OR REPLACE FUNCTION public.increment_website_visits(website_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.websites
    SET visits = visits + 1
    WHERE id = website_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create policies for websites
CREATE POLICY "Users can view their own websites"
ON public.websites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websites"
ON public.websites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
ON public.websites FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
ON public.websites FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for domains
CREATE POLICY "Users can view domains for their websites"
ON public.domains FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = domains.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create domains for their websites"
ON public.domains FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = domains.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update domains for their websites"
ON public.domains FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = domains.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete domains for their websites"
ON public.domains FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = domains.website_id
        AND websites.user_id = auth.uid()
    )
);

-- Create policies for integrations
CREATE POLICY "Users can view their own integrations"
ON public.integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
ON public.integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
ON public.integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
ON public.integrations FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for assets
CREATE POLICY "Users can view assets for their websites"
ON public.assets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = assets.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create assets for their websites"
ON public.assets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = assets.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update assets for their websites"
ON public.assets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = assets.website_id
        AND websites.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete assets for their websites"
ON public.assets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE websites.id = assets.website_id
        AND websites.user_id = auth.uid()
    )
);

-- Create policies for machines
CREATE POLICY "Users can view their own machines"
ON machines FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own machines"
ON machines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own machines"
ON machines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own machines"
ON machines FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS machines_user_id_idx ON machines(user_id);
CREATE INDEX IF NOT EXISTS machines_machine_id_idx ON machines(machine_id);
CREATE INDEX IF NOT EXISTS machines_status_idx ON machines(status);

