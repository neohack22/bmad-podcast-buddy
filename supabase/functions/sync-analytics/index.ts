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
    // Initialiser le client Supabase avec la clé service
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Cette fonction peut être appelée via un cron job
    // pour synchroniser automatiquement les analytics

    const { data: users } = await supabaseAdmin
      .from('user_youtube_tokens')
      .select('user_id, access_token, refresh_token')

    for (const user of users || []) {
      try {
        // 1. Récupérer les vidéos YouTube de l'utilisateur
        const { data: videos } = await supabaseAdmin
          .from('videos')
          .select('id, platform_video_id')
          .eq('user_id', user.user_id)
          .eq('platform', 'youtube')

        // 2. Pour chaque vidéo, récupérer les analytics depuis YouTube
        for (const video of videos || []) {
          const analytics = await fetchYouTubeAnalytics(
            video.platform_video_id,
            user.access_token
          )

          // 3. Insérer/mettre à jour dans analytics_data
          await supabaseAdmin
            .from('analytics_data')
            .upsert({
              video_id: video.id,
              date: new Date().toISOString().split('T')[0],
              views: analytics.views,
              likes: analytics.likes,
              comments: analytics.comments,
              shares: analytics.shares,
              watch_time_seconds: analytics.watchTimeSeconds,
              subscribers_gained: 0 // YouTube Analytics API ne fournit pas cette donnée par vidéo
            })
        }
      } catch (error) {
        console.error(`Erreur sync pour utilisateur ${user.user_id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analytics synchronisées' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur inconnue' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})

async function fetchYouTubeAnalytics(videoId: string, accessToken: string) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const url = `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `ids=channel==MINE&` +
    `startDate=${yesterday}&` +
    `endDate=${today}&` +
    `metrics=views,likes,comments,shares,estimatedMinutesWatched&` +
    `filters=video==${videoId}&` +
    `access_token=${accessToken}`

  const response = await fetch(url)
  const data = await response.json()

  return {
    views: data.rows?.[0]?.[0] || 0,
    likes: data.rows?.[0]?.[1] || 0,
    comments: data.rows?.[0]?.[2] || 0,
    shares: data.rows?.[0]?.[3] || 0,
    watchTimeSeconds: (data.rows?.[0]?.[4] || 0) * 60
  }
}