-- Create channels table
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  source_url TEXT,
  stream_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  rtmp_output_url TEXT GENERATED ALWAYS AS ('rtmp://live.manus.tv/live/' || stream_key) STORED,
  hls_output_url TEXT GENERATED ALWAYS AS ('https://hls.manus.tv/live/' || stream_key || '.m3u8') STORED,
  status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own channels"
ON public.channels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own channels"
ON public.channels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels"
ON public.channels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels"
ON public.channels FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();