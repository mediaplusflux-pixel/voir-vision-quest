-- Create activation_keys table
CREATE TABLE public.activation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  max_usage INTEGER DEFAULT NULL,
  machine_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activation_key_id UUID REFERENCES public.activation_keys(id),
  channel_name TEXT DEFAULT 'Ma Chaîne',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.activation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activation_keys (only admins can manage)
CREATE POLICY "Admins can view all activation keys"
  ON public.activation_keys FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert activation keys"
  ON public.activation_keys FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update activation keys"
  ON public.activation_keys FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to generate activation keys
CREATE OR REPLACE FUNCTION public.generate_activation_key(duration_months INTEGER DEFAULT 3)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  -- Generate a unique key
  LOOP
    new_key := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) || '-' ||
                     substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) || '-' ||
                     substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) || '-' ||
                     substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    SELECT EXISTS(SELECT 1 FROM public.activation_keys WHERE key = new_key) INTO key_exists;
    EXIT WHEN NOT key_exists;
  END LOOP;
  
  -- Insert the key
  INSERT INTO public.activation_keys (key, expires_at, created_by)
  VALUES (new_key, now() + (duration_months || ' months')::interval, auth.uid());
  
  RETURN new_key;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();