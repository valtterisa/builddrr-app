-- Add subscription_interval column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_interval TEXT;

