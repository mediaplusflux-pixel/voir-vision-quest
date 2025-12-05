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
    const { channelId, streamId, reason } = await req.json();

    if (!channelId && !streamId) {
      throw new Error('Missing required parameter: channelId or streamId');
    }

    console.log(`[ffmpeg-stop] Stopping broadcast for channel: ${channelId}, streamId: ${streamId}`);

    // Get FFmpeg API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_') || ffmpegApiKey.startsWith('sk_test_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-stop] MODE SIMULATION activé - pas d\'appel API réel');
      data = {
        streamId: streamId || channelId,
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
        message: 'Broadcast stopped in simulation mode'
      };
    } else {
      console.log('[ffmpeg-stop] Calling FFmpeg API...');
      try {
        // Use streamId if available, otherwise use channelId
        const targetId = streamId || channelId;
        
        const response = await fetch(`${FFMPEG_API_BASE_URL}/streams/${targetId}/stop`, {
          method: 'POST',
          headers: {
            'X-API-Key': ffmpegApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: reason || 'User requested stop',
            gracefulShutdown: true
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[ffmpeg-stop] FFmpeg API error:', response.status, errorData);
          throw new Error(`FFmpeg API error: ${response.status} - ${errorData}`);
        }

        data = await response.json();
        console.log('[ffmpeg-stop] Broadcast stopped successfully:', data);
      } catch (error) {
        console.error('[ffmpeg-stop] Network error:', error);
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
        status: 'stopped',
        stoppedAt: data.stoppedAt || new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ffmpeg-stop] Error stopping broadcast:', error);
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
