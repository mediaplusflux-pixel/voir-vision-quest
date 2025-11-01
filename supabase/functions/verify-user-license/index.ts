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
    const { licenseKey } = await req.json();
    
    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: 'License key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate license with external API
    const licenseApiKey = Deno.env.get('LICENSE_API_KEY');
    const validationResponse = await fetch(
      'https://nyrjuhmrdfnsaqgwbxwn.supabase.co/functions/v1/validate-license',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${licenseApiKey}`,
        },
        body: JSON.stringify({ licenseKey }),
      }
    );

    const validationData = await validationResponse.json();
    console.log('License validation response:', validationData);

    if (!validationData.valid) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: validationData.message || 'Licence invalide' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save or update license in database
    const { data: existingLicense } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingLicense) {
      // Update existing license
      const { error: updateError } = await supabase
        .from('user_licenses')
        .update({
          license_key: licenseKey,
          license_level: validationData.licenseLevel,
          expires_at: validationData.expiresAt,
          validated_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating license:', updateError);
        throw updateError;
      }
    } else {
      // Insert new license
      const { error: insertError } = await supabase
        .from('user_licenses')
        .insert({
          user_id: user.id,
          license_key: licenseKey,
          license_level: validationData.licenseLevel,
          expires_at: validationData.expiresAt,
          validated_at: new Date().toISOString(),
          is_active: true,
        });

      if (insertError) {
        console.error('Error inserting license:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        licenseLevel: validationData.licenseLevel,
        expiresAt: validationData.expiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-user-license function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});