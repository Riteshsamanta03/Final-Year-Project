-- Drop the old check constraint
ALTER TABLE public.emergency_bookings DROP CONSTRAINT IF EXISTS emergency_bookings_status_check;

-- Add updated check constraint with 'dispatched' and 'in_progress' statuses
ALTER TABLE public.emergency_bookings 
ADD CONSTRAINT emergency_bookings_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'dispatched'::text, 'en_route'::text, 'in_progress'::text, 'arrived'::text, 'completed'::text, 'cancelled'::text]));