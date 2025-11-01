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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature for security
    const signature = req.headers.get('X-FFmpeg-Signature');
    const ffmpegApiKey = Deno.env.get('FFMPEG_CLOUD_API_KEY');
    
    // Simple signature verification - you should implement proper HMAC verification
    if (signature !== ffmpegApiKey) {
      throw new Error('Invalid webhook signature');
    }

    const webhookData = await req.json();
    console.log('Received webhook from FFmpeg Cloud:', webhookData);

    const { channelId, event, status, error: errorMsg, timestamp } = webhookData;

    if (!channelId || !event) {
      throw new Error('Invalid webhook payload');
    }

    // Log the event for monitoring
    console.log(`FFmpeg event for channel ${channelId}: ${event} - ${status}`);

    // Here you could:
    // 1. Update database with new status
    // 2. Send notifications to users
    // 3. Trigger other actions based on events

    // Example: Log to a monitoring table (you'd need to create this table)
    // await supabaseClient
    //   .from('broadcast_events')
    //   .insert({
    //     channel_id: channelId,
    //     event_type: event,
    //     status,
    //     error_message: errorMsg,
    //     timestamp: timestamp || new Date().toISOString(),
    //   });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
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
