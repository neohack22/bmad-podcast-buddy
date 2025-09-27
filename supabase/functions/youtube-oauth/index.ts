import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, code, state, user_id } = await req.json();
    console.log('YouTube OAuth request:', { action, state: state || user_id });

    if (action === 'get_auth_url') {
      // Générer l'URL d'autorisation YouTube
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth`
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}` // state contient l'ID utilisateur

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })

    } else if (action === 'exchange_code') {
      // Échanger le code d'autorisation contre des tokens
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth`

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new Error(`OAuth error: ${tokenData.error_description}`)
      }

      // Récupérer les informations du canal YouTube
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        }
      )

      const channelData = await channelResponse.json()
      const channel = channelData.items?.[0]

      // Calculer la date d'expiration
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

      // Stocker les tokens en base de données
      const { error: insertError } = await supabaseAdmin
        .from('youtube_tokens')
        .upsert({
          user_id: state, // state contient l'ID utilisateur
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          channel_id: channel?.id,
          channel_name: channel?.snippet?.title,
        })

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`)
      }

      return new Response(JSON.stringify({ 
        success: true,
        channel: {
          id: channel?.id,
          name: channel?.snippet?.title,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })

    } else if (action === 'disconnect') {
      // Déconnecter YouTube
      
      const { error } = await supabaseAdmin
        .from('youtube_tokens')
        .delete()
        .eq('user_id', user_id)

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })

    } else {
      throw new Error('Action non supportée')
    }

  } catch (error: any) {
    console.error('Erreur YouTube OAuth:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur inconnue' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})