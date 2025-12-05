import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

// HMAC SHA256 signature verification
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return signature === expectedSignature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const webhookData = JSON.parse(rawBody);

    // Verify webhook signature using HMAC SHA256
    const signature = req.headers.get('X-Webhook-Signature');
    const webhookSecret = Deno.env.get('FFMPEG_WEBHOOK_SECRET');
    
    if (webhookSecret && signature) {
      const isValid = await verifySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('[ffmpeg-webhook] Invalid webhook signature');
        throw new Error('Invalid webhook signature');
      }
      console.log('[ffmpeg-webhook] Signature verified successfully');
    } else {
      console.warn('[ffmpeg-webhook] No signature verification - webhook secret not configured');
    }

    console.log('[ffmpeg-webhook] Received webhook:', JSON.stringify(webhookData));

    const { eventType, data } = webhookData;

    if (!eventType) {
      throw new Error('Invalid webhook payload - missing eventType');
    }

    // Handle different event types
    switch (eventType) {
      case 'stream.status.changed':
        console.log(`[ffmpeg-webhook] Stream ${data.streamId} status changed: ${data.previousStatus} -> ${data.currentStatus}`);
        if (data.m3u8Url) {
          console.log(`[ffmpeg-webhook] HLS URL: ${data.m3u8Url}`);
        }
        break;
        
      case 'stream.output.generated':
        console.log(`[ffmpeg-webhook] Stream ${data.streamId} output generated`);
        console.log(`[ffmpeg-webhook] Outputs:`, JSON.stringify(data.outputs));
        if (data.shareableLinks) {
          console.log(`[ffmpeg-webhook] Shareable links:`, JSON.stringify(data.shareableLinks));
        }
        break;
        
      case 'stream.error':
        console.error(`[ffmpeg-webhook] Stream ${data.streamId} error: ${data.errorCode} - ${data.errorMessage}`);
        break;
        
      case 'job.completed':
        console.log(`[ffmpeg-webhook] Job ${data.jobId} completed`);
        break;
        
      case 'job.failed':
        console.error(`[ffmpeg-webhook] Job ${data.jobId} failed: ${data.errorMessage}`);
        break;
        
      default:
        console.log(`[ffmpeg-webhook] Unknown event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        eventType,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[ffmpeg-webhook] Error processing webhook:', error);
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
