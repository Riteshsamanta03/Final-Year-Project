-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create emergency bookings" ON public.emergency_bookings;

-- Create a PERMISSIVE policy that allows anyone to insert
CREATE POLICY "Anyone can create emergency bookings" 
ON public.emergency_bookings 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);