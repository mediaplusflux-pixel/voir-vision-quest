import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FFMPEG_API_BASE_URL = 'https://ffmpeg-api.mediaplus.broadcast/api/v1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId, streamId, protocol, url, targetIp, targetPort, bitrate, resolution } = await req.json();

    if (!channelId || !protocol || (!url && !targetIp)) {
      throw new Error('Missing required parameters: channelId, protocol, and url/targetIp are required');
    }

    // Validate protocol
    const validProtocols = ['ip', 'udp', 'rtmp', 'hls', 'dash'];
    if (!validProtocols.includes(protocol.toLowerCase())) {
      throw new Error('Invalid protocol. Must be ip, udp, rtmp, hls, or dash');
    }

    console.log(`[ffmpeg-transmit] Configuring ${protocol} transmission for channel ${channelId}`);

    // Get FFmpeg API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_') || ffmpegApiKey.startsWith('sk_test_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-transmit] MODE SIMULATION activé');
      data = {
        streamId: streamId || Math.floor(Math.random() * 1000),
        status: 'configured',
        m3u8Url: `https://mediaplus.broadcast/hls/${channelId}/index.m3u8`,
        dashUrl: `https://mediaplus.broadcast/dash/${channelId}/manifest.mpd`,
        message: 'Transmission configured in simulation mode'
      };
    } else {
      console.log('[ffmpeg-transmit] Calling FFmpeg API...');
      try {
        // Create IP Output Stream for the transmission
        const response = await fetch(`${FFMPEG_API_BASE_URL}/streams/ip-output`, {
          method: 'POST',
          headers: {
            'X-API-Key': ffmpegApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: streamId || channelId,
            streamName: `channel-${channelId}-${protocol}`,
            targetIp: targetIp || url.split(':')[0],
            targetPort: targetPort || parseInt(url.split(':')[1]) || 8080,
            bitrate: bitrate || '5000k',
            resolution: resolution || '1920x1080',
            segmentDuration: 10,
            playlistLength: 3,
            webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ffmpeg-webhook`
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[ffmpeg-transmit] FFmpeg API error:', response.status, errorData);
          throw new Error(`FFmpeg API error: ${response.status} - ${errorData}`);
        }

        data = await response.json();
        console.log('[ffmpeg-transmit] Transmission configured successfully:', data);
      } catch (error) {
        console.error('[ffmpeg-transmit] Network error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Unable to reach FFmpeg API: ${errorMessage}`);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        streamId: data.streamId,
        protocol,
        url: url || `${targetIp}:${targetPort}`,
        hlsUrl: data.m3u8Url,
        dashUrl: data.dashUrl,
        status: data.status || 'configured',
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
