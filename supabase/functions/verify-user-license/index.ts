const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key } = await req.json();

    if (!license_key) {
      return new Response(
        JSON.stringify({ valid: false, message: 'License key is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate the license key by calling external validation API
    const validationResponse = await fetch(
      'https://nyrjuhmrdfnsaqgwbxwn.supabase.co/functions/v1/validate-license',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ license_key }),
      }
    );

    const validationData = await validationResponse.json();

    if (!validationData.valid) {
      return new Response(
        JSON.stringify({ valid: false, message: validationData.message || 'Invalid license key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Return the validated license information
    return new Response(
      JSON.stringify({
        valid: true,
        license_level: validationData.license_level,
        expires_at: validationData.expires_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-user-license function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ valid: false, message: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
