import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, machineId, ipAddress } = await req.json();

    console.log('Validating activation key:', { key, machineId, ipAddress });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the activation key
    const { data: activationKey, error: keyError } = await supabaseClient
      .from('activation_keys')
      .select('*')
      .eq('key', key)
      .single();

    if (keyError || !activationKey) {
      console.error('Key not found:', keyError);
      return new Response(
        JSON.stringify({ valid: false, message: 'Clé d\'activation invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if key is active
    if (!activationKey.is_active) {
      console.log('Key is not active');
      return new Response(
        JSON.stringify({ valid: false, message: 'Cette clé a été désactivée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if key is expired
    const now = new Date();
    const expiresAt = new Date(activationKey.expires_at);
    if (expiresAt < now) {
      console.log('Key is expired');
      return new Response(
        JSON.stringify({ valid: false, message: 'Cette clé a expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check max usage if set
    if (activationKey.max_usage !== null && activationKey.usage_count >= activationKey.max_usage) {
      console.log('Key usage limit reached');
      return new Response(
        JSON.stringify({ valid: false, message: 'Cette clé a atteint sa limite d\'utilisation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check machine_id if set (for security)
    if (activationKey.machine_id && activationKey.machine_id !== machineId) {
      console.log('Machine ID mismatch');
      return new Response(
        JSON.stringify({ valid: false, message: 'Cette clé est liée à une autre machine' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update activation key with first use info or increment usage
    const updates: any = {
      usage_count: activationKey.usage_count + 1,
    };

    if (!activationKey.activated_at) {
      updates.activated_at = new Date().toISOString();
      if (machineId) updates.machine_id = machineId;
      if (ipAddress) updates.ip_address = ipAddress;
    }

    const { error: updateError } = await supabaseClient
      .from('activation_keys')
      .update(updates)
      .eq('id', activationKey.id);

    if (updateError) {
      console.error('Error updating key:', updateError);
    }

    console.log('Key validated successfully');
    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'Clé validée avec succès',
        expiresAt: activationKey.expires_at,
        keyId: activationKey.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in validate-activation-key function:', error);
    return new Response(
      JSON.stringify({ valid: false, message: 'Erreur lors de la validation' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});