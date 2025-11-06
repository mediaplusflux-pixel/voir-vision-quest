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
    const { channelId, source, sourceUrl } = await req.json();

    if (!channelId || !source) {
      throw new Error('Missing required parameters: channelId and source are required');
    }

    console.log(`[ffmpeg-start] Starting broadcast for channel: ${channelId}, source: ${source}`);

    // Parse playlist data if source is playlist
    let playlistData = null;
    if (source === 'playlist' && sourceUrl) {
      try {
        playlistData = JSON.parse(sourceUrl);
        console.log(`[ffmpeg-start] Parsed playlist with ${playlistData.urls?.length || 0} videos`);
      } catch (e) {
        console.error('[ffmpeg-start] Failed to parse playlist data:', e);
      }
    }

    // Get FFmpeg Cloud API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    if (!ffmpegApiKey) {
      throw new Error('FFMPEG_CLOUD_API_KEY not configured');
    }

    // Prepare request payload
    const requestPayload = {
      channelId,
      source,
      sourceUrl: playlistData ? playlistData.urls : sourceUrl,
      loop: playlistData ? playlistData.loop : false,
    };

    console.log('[ffmpeg-start] Calling FFmpeg Cloud API with payload:', JSON.stringify(requestPayload));

    // Call FFmpeg Cloud API
    const response = await fetch('https://ffmpeg-cloud-api.com/v1/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ffmpegApiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[ffmpeg-start] FFmpeg Cloud API error:', response.status, errorData);
      throw new Error(`FFmpeg Cloud API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('[ffmpeg-start] Broadcast started successfully:', data);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        hlsUrl: data.hlsUrl || `https://media-plus.app/streams/${channelId}.m3u8`,
        iframeUrl: data.iframeUrl || `https://media-plus.app/embed/channel/${channelId}`,
        status: data.status || 'live',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ffmpeg-start] Error starting broadcast:', error);
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
