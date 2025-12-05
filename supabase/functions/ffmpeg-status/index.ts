import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FFMPEG_API_BASE_URL = 'https://ffmpeg-api.mediaplus.broadcast/api/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId, streamId } = await req.json();

    if (!channelId && !streamId) {
      throw new Error('Missing channelId or streamId parameter');
    }

    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    console.log(`[ffmpeg-status] Fetching status for channel ${channelId}, streamId: ${streamId}`);

    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_') || ffmpegApiKey.startsWith('sk_test_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-status] MODE SIMULATION activé');
      data = {
        streamId: streamId || channelId,
        status: 'idle',
        m3u8Url: `https://mediaplus.broadcast/hls/${channelId}/index.m3u8`,
        dashUrl: `https://mediaplus.broadcast/dash/${channelId}/manifest.mpd`,
        startedAt: null
      };
    } else {
      console.log('[ffmpeg-status] Calling FFmpeg API...');
      try {
        const targetId = streamId || channelId;
        
        const response = await fetch(`${FFMPEG_API_BASE_URL}/streams/${targetId}`, {
          method: 'GET',
          headers: {
            'X-API-Key': ffmpegApiKey,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[ffmpeg-status] FFmpeg API error:', errorData);
          throw new Error(`FFmpeg API error: ${response.status}`);
        }

        data = await response.json();
        console.log('[ffmpeg-status] Status retrieved:', data);
      } catch (error) {
        console.error('[ffmpeg-status] Network error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Unable to reach FFmpeg API: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        streamId: data.streamId,
        status: data.status,
        hlsUrl: data.m3u8Url,
        dashUrl: data.dashUrl,
        iframeUrl: `https://mediaplus.broadcast/embed/channel/${channelId}`,
        startedAt: data.startedAt,
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
