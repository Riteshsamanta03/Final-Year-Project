-- Enable full replica identity for ambulances table to capture all changes
ALTER TABLE public.ambulances REPLICA IDENTITY FULL;