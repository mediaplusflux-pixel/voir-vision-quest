-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for persistent active playlists
CREATE TABLE public.active_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Playlist active',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_index INTEGER NOT NULL DEFAULT 0,
  is_playing BOOLEAN NOT NULL DEFAULT false,
  play_mode TEXT NOT NULL DEFAULT 'loop',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.active_playlists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own playlists" 
ON public.active_playlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
ON public.active_playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.active_playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.active_playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_active_playlists_updated_at
BEFORE UPDATE ON public.active_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_playlists;