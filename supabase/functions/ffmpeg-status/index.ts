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
    const { channelId } = await req.json();

    if (!channelId) {
      throw new Error('Missing channelId parameter');
    }

    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    if (!ffmpegApiKey) {
      throw new Error('FFMPEG_CLOUD_API_KEY not configured');
    }

    console.log(`Fetching status for channel ${channelId}`);

    // Call FFmpeg Cloud API
    const response = await fetch(`https://ffmpeg-cloud-api.com/v1/status/${channelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ffmpegApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('FFmpeg Cloud error:', errorData);
      throw new Error(`FFmpeg Cloud API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        status: data.status,
        duration: data.duration,
        source: data.source,
        hlsUrl: data.hlsUrl,
        iframeUrl: data.iframeUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching status:', error);
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
