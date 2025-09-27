// Service pour tracker les analytics des vidéos internes
import { supabase } from "@/integrations/supabase/client";

export class InternalAnalyticsService {
  // Enregistrer une vue de vidéo
  static async trackView(videoId: string, watchTimeSeconds: number = 0) {
    try {
      // Vérifier si on a déjà une entrée pour aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('analytics_data')
        .select('id, views, watch_time_seconds')
        .eq('video_id', videoId)
        .eq('date', today)
        .single();

      if (existing) {
        // Mettre à jour l'entrée existante
        await supabase
          .from('analytics_data')
          .update({
            views: existing.views + 1,
            watch_time_seconds: existing.watch_time_seconds + watchTimeSeconds
          })
          .eq('id', existing.id);
      } else {
        // Créer une nouvelle entrée
        await supabase
          .from('analytics_data')
          .insert({
            video_id: videoId,
            date: today,
            views: 1,
            watch_time_seconds: watchTimeSeconds,
            likes: 0,
            comments: 0,
            shares: 0,
            subscribers_gained: 0
          });
      }
    } catch (error) {
      console.error('Erreur tracking vue:', error);
    }
  }

  // Enregistrer un like
  static async trackLike(videoId: string) {
    await this.incrementMetric(videoId, 'likes', 1);
  }

  // Enregistrer un commentaire
  static async trackComment(videoId: string) {
    await this.incrementMetric(videoId, 'comments', 1);
  }

  // Enregistrer un partage
  static async trackShare(videoId: string) {
    await this.incrementMetric(videoId, 'shares', 1);
  }

  private static async incrementMetric(videoId: string, metric: string, value: number) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('video_id', videoId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('analytics_data')
          .update({
            [metric]: ((existing as any)[metric] || 0) + value
          })
          .eq('id', existing.id);
      } else {
        // Créer une nouvelle entrée avec la métrique
        const newEntry = {
          video_id: videoId,
          date: today,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          watch_time_seconds: 0,
          subscribers_gained: 0,
          [metric]: value
        };
        
        await supabase
          .from('analytics_data')
          .insert(newEntry);
      }
    } catch (error) {
      console.error(`Erreur tracking ${metric}:`, error);
    }
  }
}