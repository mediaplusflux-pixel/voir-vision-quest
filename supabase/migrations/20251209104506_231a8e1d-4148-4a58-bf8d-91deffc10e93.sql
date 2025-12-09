-- Update the generated columns with the real Manus server URLs
ALTER TABLE public.channels 
  DROP COLUMN rtmp_output_url,
  DROP COLUMN hls_output_url;

ALTER TABLE public.channels 
  ADD COLUMN rtmp_output_url TEXT GENERATED ALWAYS AS ('rtmp://80-ikb4ruuazsxbbgwwskkqc-b2ab0065.manusvm.computer:1935/live/' || stream_key) STORED,
  ADD COLUMN hls_output_url TEXT GENERATED ALWAYS AS ('https://80-ikb4ruuazsxbbgwwskkqc-b2ab0065.manusvm.computer/hls/' || stream_key || '.m3u8') STORED;