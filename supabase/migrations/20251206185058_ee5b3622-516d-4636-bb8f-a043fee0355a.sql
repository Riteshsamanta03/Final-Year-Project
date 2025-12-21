-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  beds_available INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  departments TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'limited', 'full')),
  rating DECIMAL(2,1) DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ambulances table
CREATE TABLE public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT DEFAULT 'standard' CHECK (vehicle_type IN ('standard', 'icu', 'neonatal')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  last_location_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_bookings table
CREATE TABLE public.emergency_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  destination_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  emergency_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled')),
  eta_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transport_bookings table (scheduled transport)
CREATE TABLE public.transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  transport_type TEXT DEFAULT 'ambulatory' CHECK (transport_type IN ('wheelchair', 'stretcher', 'ambulatory')),
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  health_id TEXT UNIQUE,
  blood_type TEXT,
  date_of_birth DATE,
  allergies TEXT[],
  chronic_conditions TEXT[],
  medications TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('prescription', 'allergy', 'condition', 'document', 'lab_result')),
  title TEXT NOT NULL,
  description TEXT,
  doctor_name TEXT,
  hospital_name TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default patient role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_bookings_updated_at
  BEFORE UPDATE ON public.emergency_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for hospitals (public read, admin write)
CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage hospitals"
  ON public.hospitals FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ambulances
CREATE POLICY "Authenticated users can view ambulances"
  ON public.ambulances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can update their own ambulance"
  ON public.ambulances FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage ambulances"
  ON public.ambulances FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for emergency_bookings
CREATE POLICY "Users can view their own bookings"
  ON public.emergency_bookings FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON public.emergency_bookings FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Drivers can view assigned bookings"
  ON public.emergency_bookings FOR SELECT
  TO authenticated
  USING (
    ambulance_id IN (SELECT id FROM public.ambulances WHERE driver_id = auth.uid())
  );

CREATE POLICY "Drivers can update assigned bookings"
  ON public.emergency_bookings FOR UPDATE
  TO authenticated
  USING (
    ambulance_id IN (SELECT id FROM public.ambulances WHERE driver_id = auth.uid())
  );

CREATE POLICY "Admins can manage all bookings"
  ON public.emergency_bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transport_bookings
CREATE POLICY "Users can view their own transport bookings"
  ON public.transport_bookings FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Users can create transport bookings"
  ON public.transport_bookings FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Admins can manage all transport bookings"
  ON public.transport_bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for health_records
CREATE POLICY "Users can manage their own health records"
  ON public.health_records FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all health records"
  ON public.health_records FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_records
CREATE POLICY "Users can manage their own medical records"
  ON public.medical_records FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Enable realtime for ambulances (for GPS tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_bookings;

-- Insert sample hospitals
INSERT INTO public.hospitals (name, location, phone, latitude, longitude, beds_available, total_beds, departments, status, rating) VALUES
('Metro General Hospital', '123 Healthcare Ave, Downtown', '(555) 123-4567', 37.7749, -122.4194, 45, 120, ARRAY['Emergency', 'Cardiology', 'Neurology', 'Orthopedics'], 'available', 4.8),
('City Medical Center', '456 Medical Blvd, Midtown', '(555) 234-5678', 37.7849, -122.4094, 12, 80, ARRAY['Emergency', 'Pediatrics', 'Internal Medicine'], 'limited', 4.6),
('University Health System', '789 University Dr, Campus', '(555) 345-6789', 37.7649, -122.4294, 78, 200, ARRAY['Emergency', 'Trauma', 'Oncology', 'Cardiology', 'Neurology'], 'available', 4.9),
('Riverside Community Hospital', '321 River Road, Eastside', '(555) 456-7890', 37.7549, -122.4394, 0, 60, ARRAY['Emergency', 'General Surgery'], 'full', 4.4),
('St. Marys Medical Center', '654 Faith Street, Westend', '(555) 567-8901', 37.7449, -122.4494, 33, 150, ARRAY['Emergency', 'Maternity', 'Pediatrics', 'Cardiology'], 'available', 4.7);

-- Insert sample ambulances
INSERT INTO public.ambulances (vehicle_number, vehicle_type, status, current_latitude, current_longitude) VALUES
('AMB-001', 'standard', 'available', 37.7749, -122.4194),
('AMB-002', 'icu', 'available', 37.7849, -122.4094),
('AMB-003', 'standard', 'busy', 37.7649, -122.4294),
('AMB-004', 'neonatal', 'available', 37.7549, -122.4394),
('AMB-005', 'standard', 'offline', 37.7449, -122.4494);