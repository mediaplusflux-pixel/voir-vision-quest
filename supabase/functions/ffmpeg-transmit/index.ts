import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId, protocol, url } = await req.json();

    if (!channelId || !protocol || !url) {
      throw new Error('Missing required parameters: channelId, protocol, and url are required');
    }

    // Validate protocol
    const validProtocols = ['ip', 'udp', 'rtmp'];
    if (!validProtocols.includes(protocol.toLowerCase())) {
      throw new Error('Invalid protocol. Must be ip, udp, or rtmp');
    }

    console.log(`[ffmpeg-transmit] Configuring ${protocol} transmission for channel ${channelId}`);

    // Get FFmpeg Cloud API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-transmit] MODE SIMULATION activé');
      data = {
        status: 'configured',
        channelId: channelId,
        protocol: protocol,
        url: url,
        message: 'Transmission configured in simulation mode'
      };
    } else {
      console.log('[ffmpeg-transmit] Calling FFmpeg Cloud API...');
      try {
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
          console.error('[ffmpeg-transmit] FFmpeg Cloud API error:', response.status, errorData);
          throw new Error(`FFmpeg Cloud API error: ${response.status} - ${errorData}`);
        }

        data = await response.json();
        console.log('[ffmpeg-transmit] Transmission configured successfully:', data);
      } catch (error) {
        console.error('[ffmpeg-transmit] Network error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Unable to reach FFmpeg Cloud API: ${errorMessage}`);
      }
    }

    // Return success response
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
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ffmpeg-transmit] Error configuring transmission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
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
