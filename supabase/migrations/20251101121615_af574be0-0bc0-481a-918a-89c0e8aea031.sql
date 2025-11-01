-- Create user_licenses table
CREATE TABLE public.user_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL,
  license_level TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_licenses ENABLE ROW LEVEL SECURITY;

-- Policies for user_licenses
CREATE POLICY "Users can view their own license"
  ON public.user_licenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own license"
  ON public.user_licenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own license"
  ON public.user_licenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all licenses"
  ON public.user_licenses
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_licenses_updated_at
  BEFORE UPDATE ON public.user_licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();