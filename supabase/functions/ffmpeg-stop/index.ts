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
    const { channelId } = await req.json();

    if (!channelId) {
      throw new Error('Missing required parameter: channelId');
    }

    console.log(`[ffmpeg-stop] Stopping broadcast for channel: ${channelId}`);

    // Get FFmpeg Cloud API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-stop] MODE SIMULATION activé - pas d\'appel API réel');
      data = {
        status: 'stopped',
        channelId: channelId,
        message: 'Broadcast stopped in simulation mode'
      };
    } else {
      console.log('[ffmpeg-stop] Calling FFmpeg Cloud API...');
      try {
        const response = await fetch(`https://ffmpeg-cloud-api.com/v1/stop/${channelId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ffmpegApiKey}`,
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[ffmpeg-stop] FFmpeg Cloud API error:', response.status, errorData);
          throw new Error(`FFmpeg Cloud API error: ${response.status} - ${errorData}`);
        }

        data = await response.json();
        console.log('[ffmpeg-stop] Broadcast stopped successfully:', data);
      } catch (error) {
        console.error('[ffmpeg-stop] Network error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Unable to reach FFmpeg Cloud API: ${errorMessage}`);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        status: 'stopped',
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
