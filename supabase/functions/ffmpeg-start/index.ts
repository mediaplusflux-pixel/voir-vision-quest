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
    const { channelId, source, sourceUrl, bitrate, resolution } = await req.json();

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

    // Get FFmpeg API key
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');

    // MODE SIMULATION pour développement
    const isSimulationMode = !ffmpegApiKey || ffmpegApiKey.startsWith('demo_') || ffmpegApiKey.startsWith('sk_test_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-start] MODE SIMULATION activé - pas d\'appel API réel');
      data = {
        streamId: Math.floor(Math.random() * 1000),
        status: 'streaming',
        m3u8Url: `https://mediaplus.broadcast/hls/${channelId}/index.m3u8`,
        dashUrl: `https://mediaplus.broadcast/dash/${channelId}/manifest.mpd`,
        message: 'Broadcast started in simulation mode'
      };
    } else {
      console.log('[ffmpeg-start] Calling FFmpeg API...');
      
      try {
        // Step 1: Create FFmpeg Job with required output formats
        const jobResponse = await fetch(`${FFMPEG_API_BASE_URL}/ffmpeg/jobs`, {
          method: 'POST',
          headers: {
            'X-API-Key': ffmpegApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobName: `Channel ${channelId} Broadcast`,
            inputUrl: playlistData ? playlistData.urls?.[0] : sourceUrl,
            outputPath: `/output/${channelId}`,
            ffmpegCommand: 'ffmpeg -i {input} -c:v libx264 -c:a aac {output}',
            outputFormat: 'hls',
            webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ffmpeg-webhook`,
            // Specify required output links
            outputLinks: {
              hlsEnabled: true,        // URL HLS m3u8
              iframeEnabled: true,     // Lien iframe avec lecteur intégré
              ipHttpEnabled: true      // Lien IP HTTP m3u8
            },
            // Output URLs configuration
            outputConfig: {
              hlsPath: `/hls/${channelId}/index.m3u8`,
              iframePath: `/embed/channel/${channelId}`,
              ipHttpPath: `/stream/${channelId}/live.m3u8`
            }
          }),
        });

        if (!jobResponse.ok) {
          const errorData = await jobResponse.text();
          console.error('[ffmpeg-start] FFmpeg API error (create job):', jobResponse.status, errorData);
          throw new Error(`FFmpeg API error: ${jobResponse.status} - ${errorData}`);
        }

        const jobData = await jobResponse.json();
        console.log('[ffmpeg-start] Job created:', jobData);

        // Step 2: Create IP Output Stream with all output formats
        const streamResponse = await fetch(`${FFMPEG_API_BASE_URL}/streams/ip-output`, {
          method: 'POST',
          headers: {
            'X-API-Key': ffmpegApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobData.jobId,
            streamName: `channel-${channelId}-main`,
            targetIp: '0.0.0.0',
            targetPort: 8080,
            bitrate: bitrate || '5000k',
            resolution: resolution || '1920x1080',
            segmentDuration: 10,
            playlistLength: 3,
            webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ffmpeg-webhook`,
            // Request all output link types
            requestedOutputs: ['hls_m3u8', 'iframe_player', 'ip_http_m3u8'],
            outputFormats: {
              hls: {
                enabled: true,
                segmentDuration: 10,
                playlistType: 'event'
              },
              iframe: {
                enabled: true,
                playerType: 'embedded',
                autoplay: true,
                controls: true
              },
              ipHttp: {
                enabled: true,
                protocol: 'http',
                format: 'm3u8'
              }
            }
          }),
        });

        if (!streamResponse.ok) {
          const errorData = await streamResponse.text();
          console.error('[ffmpeg-start] FFmpeg API error (create stream):', streamResponse.status, errorData);
          throw new Error(`FFmpeg API error: ${streamResponse.status} - ${errorData}`);
        }

        data = await streamResponse.json();
        console.log('[ffmpeg-start] Stream created successfully:', data);
      } catch (error) {
        console.error('[ffmpeg-start] Network error calling FFmpeg API:', error);
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
        hlsUrl: data.m3u8Url || `https://mediaplus.broadcast/hls/${channelId}/index.m3u8`,
        dashUrl: data.dashUrl,
        iframeUrl: `https://mediaplus.broadcast/embed/channel/${channelId}`,
        status: data.status || 'streaming',
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
