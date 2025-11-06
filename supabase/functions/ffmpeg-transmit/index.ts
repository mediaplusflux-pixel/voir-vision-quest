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
    const { channelId, protocol, url } = await req.json();

    if (!channelId || !protocol || !url) {
      throw new Error('Missing required parameters');
    }

    // Validate protocol
    const validProtocols = ['ip', 'udp', 'rtmp'];
    if (!validProtocols.includes(protocol.toLowerCase())) {
      throw new Error('Invalid protocol. Must be ip, udp, or rtmp');
    }

    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    if (!ffmpegApiKey) {
      throw new Error('FFMPEG_CLOUD_API_KEY not configured');
    }

    console.log(`Configuring ${protocol} transmission for channel ${channelId}`);

    // Call FFmpeg Cloud API
    const response = await fetch('https://ffmpeg-cloud-api.com/v1/transmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ffmpegApiKey}`,
      },
      body: JSON.stringify({
        channelId,
        protocol: protocol.toLowerCase(),
        url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('FFmpeg Cloud error:', errorData);
      throw new Error(`FFmpeg Cloud API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('Transmission configured successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        protocol,
        url,
        status: data.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error configuring transmission:', error);
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
