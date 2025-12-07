import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL de l'API FFmpeg - peut être configuré via secret FFMPEG_API_URL
const getFFmpegApiUrl = () => {
  const customUrl = Deno.env.get('FFMPEG_API_URL');
  if (customUrl) return customUrl;
  return null; // Pas d'URL par défaut - mode simulation activé
};

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
        console.log('[ffmpeg-start] sourceUrl is not JSON, using as direct URL');
      }
    }

    // Get FFmpeg API configuration
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    const ffmpegApiUrl = getFFmpegApiUrl();

    // MODE SIMULATION: activé si pas d'URL API configurée ou clé de test
    const isSimulationMode = !ffmpegApiUrl || !ffmpegApiKey || ffmpegApiKey.startsWith('demo_') || ffmpegApiKey.startsWith('sk_test_');
    
    let data;
    
    if (isSimulationMode) {
      console.log('[ffmpeg-start] MODE SIMULATION activé - génération de liens de test');
      
      // Générer un ID de stream unique
      const streamId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // URLs de simulation basées sur le projet Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://demo.supabase.co';
      const baseMediaUrl = `${supabaseUrl}/storage/v1/object/public/media-library`;
      
      data = {
        streamId,
        status: 'live',
        hlsUrl: `${baseMediaUrl}/hls/${channelId}/index.m3u8`,
        playerUrl: `${supabaseUrl}/player/${channelId}`,
        iframeCode: `<iframe src="${supabaseUrl}/embed/${channelId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
        ipHttpUrl: `${supabaseUrl}/stream/${channelId}/live.m3u8`,
        dashUrl: `${baseMediaUrl}/dash/${channelId}/manifest.mpd`,
        message: 'Diffusion démarrée en mode simulation',
        simulationMode: true,
        viewers: Math.floor(Math.random() * 100) + 10,
        bitrate: bitrate || '5000',
        resolution: resolution || '1920x1080',
      };
      
      console.log('[ffmpeg-start] Simulation data generated:', data);
    } else {
      console.log(`[ffmpeg-start] Calling real FFmpeg API at: ${ffmpegApiUrl}`);
      
      try {
        // Step 1: Create FFmpeg Job
        const jobResponse = await fetch(`${ffmpegApiUrl}/ffmpeg/jobs`, {
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
            outputLinks: {
              hlsEnabled: true,
              iframeEnabled: true,
              ipHttpEnabled: true
            },
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

        // Step 2: Create IP Output Stream
        const streamResponse = await fetch(`${ffmpegApiUrl}/streams/ip-output`, {
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
            requestedOutputs: ['hls_m3u8', 'iframe_player', 'ip_http_m3u8'],
            outputFormats: {
              hls: { enabled: true, segmentDuration: 10, playlistType: 'event' },
              iframe: { enabled: true, playerType: 'embedded', autoplay: true, controls: true },
              ipHttp: { enabled: true, protocol: 'http', format: 'm3u8' }
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

    // Build output URLs
    const hlsUrl = data.hlsUrl || data.m3u8Url || `https://stream.example.com/hls/${channelId}/index.m3u8`;
    const playerUrl = data.playerUrl || `https://stream.example.com/player/${channelId}`;
    const iframeCode = data.iframeCode || `<iframe src="https://stream.example.com/embed/${channelId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    const ipHttpUrl = data.ipHttpUrl || `http://stream.example.com/stream/${channelId}/live.m3u8`;

    console.log('[ffmpeg-start] Broadcast started successfully');

    return new Response(
      JSON.stringify({
        success: true,
        channelId,
        streamId: data.streamId,
        hlsUrl,
        playerUrl,
        iframeCode,
        ipHttpUrl,
        dashUrl: data.dashUrl,
        status: data.status || 'live',
        simulationMode: isSimulationMode,
        viewers: data.viewers || 0,
        bitrate: data.bitrate || bitrate || '5000',
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
