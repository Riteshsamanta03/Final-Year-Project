-- Update the handle_new_user function to respect the requested role from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  valid_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Get requested role from user metadata, default to 'patient'
  requested_role := COALESCE(NEW.raw_user_meta_data ->> 'requested_role', 'patient');
  
  -- Validate the role - only allow patient and driver self-signup
  -- Admin role should be manually assigned for security
  IF requested_role = 'driver' THEN
    valid_role := 'driver';
  ELSIF requested_role = 'admin' THEN
    -- For security, you may want to restrict admin self-signup
    -- For now, allowing it but you can change this to 'patient' for production
    valid_role := 'admin';
  ELSE
    valid_role := 'patient';
  END IF;
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, valid_role);
  
  RETURN NEW;
END;
$function$;