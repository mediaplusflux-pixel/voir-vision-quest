-- Assign admin role to thiernodk2@gmail.com
-- First, we need to get the user_id from auth.users for this email
-- and insert it into user_roles if it doesn't exist

-- Create a function that will assign admin role to the specified email
CREATE OR REPLACE FUNCTION assign_admin_to_email(admin_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user_id for the specified email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;
  
  -- If user exists, insert admin role if not already present
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Execute the function to assign admin role to thiernodk2@gmail.com
SELECT assign_admin_to_email('thiernodk2@gmail.com');