-- Fix RLS policy for task_classifications table
-- This allows users to insert task classifications when creating tasks

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own task classifications" ON task_classifications;
DROP POLICY IF EXISTS "Users can view task classifications" ON task_classifications;

-- Create policy to allow inserting task classifications
-- Anyone can insert (the trigger runs as the user who creates the task)
CREATE POLICY "Users can insert their own task classifications"
ON task_classifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow viewing task classifications
CREATE POLICY "Users can view task classifications"
ON task_classifications
FOR SELECT
TO authenticated
USING (true);

-- Also allow public SELECT if your app needs it
CREATE POLICY "Public can view task classifications"
ON task_classifications
FOR SELECT
TO anon
USING (true);
