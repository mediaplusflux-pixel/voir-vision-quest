-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-library', 'media-library', true);

-- Create media_library table
CREATE TABLE public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration REAL,
  thumbnail TEXT,
  type TEXT NOT NULL DEFAULT 'video',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_library
CREATE POLICY "Users can view their own media"
ON public.media_library
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media"
ON public.media_library
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
ON public.media_library
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
ON public.media_library
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all media
CREATE POLICY "Admins can view all media"
ON public.media_library
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for media-library bucket
CREATE POLICY "Users can view their own media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own media files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'media-library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'media-library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'media-library' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public access to media files (for viewing)
CREATE POLICY "Media files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-library');

-- Trigger for updated_at
CREATE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();