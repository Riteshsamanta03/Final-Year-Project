-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create bookings" ON public.emergency_bookings;

-- Create new policy that allows anyone to create emergency bookings
CREATE POLICY "Anyone can create emergency bookings" 
ON public.emergency_bookings 
FOR INSERT 
WITH CHECK (true);

-- Make patient_id nullable (it already is, but ensuring)
-- The booking can be linked to a user if logged in, or null for guests