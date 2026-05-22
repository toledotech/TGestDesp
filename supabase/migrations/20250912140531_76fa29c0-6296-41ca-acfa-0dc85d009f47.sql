-- Fix security issue with subscribers table RLS policies
-- The current policies are too permissive and allow unauthorized access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure insert policy
-- Only allow users to insert their own subscription records
CREATE POLICY "secure_insert_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  auth.email() = email
);

-- Create secure update policy  
-- Only allow users to update their own subscription records
CREATE POLICY "secure_update_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = email)
);

-- The select policy is already secure, keeping it as is
-- Policy Name: select_own_subscription allows users to only see their own records