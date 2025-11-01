import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { channelId, source, sourceUrl } = await req.json();

    if (!channelId || !source) {
      throw new Error('Missing required parameters');
    }

    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    if (!ffmpegApiKey) {
      throw new Error('FFMPEG_CLOUD_API_KEY not configured');
    }

    console.log(`Starting FFmpeg broadcast for channel ${channelId}`);

    // Call FFmpeg Cloud API
    const response = await fetch('https://ffmpeg-cloud-api.com/v1/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ffmpegApiKey}`,
      },
      body: JSON.stringify({
        channelId,
        source,
        sourceUrl,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('FFmpeg Cloud error:', errorData);
      throw new Error(`FFmpeg Cloud API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('Broadcast started successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        hlsUrl: data.hlsUrl,
        iframeUrl: data.iframeUrl,
        status: data.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error starting broadcast:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
