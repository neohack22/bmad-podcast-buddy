import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()

    if (!videoId) {
      throw new Error('ID de vidéo requis')
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      throw new Error('Clé API YouTube non configurée')
    }

    // Récupérer les informations de la vidéo
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
    )

    const data = await response.json()

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`)
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Vidéo non trouvée')
    }

    const video = data.items[0]

    return new Response(JSON.stringify({ 
      video,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error('Erreur get-video-info:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur inconnue' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})