import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  platform_video_id: string;
  platform: string;
  published_at: string;
}

interface YouTubeVideoManagerProps {
  onVideoAdded?: () => void;
}

export function YouTubeVideoManager({ onVideoAdded }: YouTubeVideoManagerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadVideos();
      }
    };
    checkUser();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('platform', 'youtube')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erreur chargement vidéos:', error);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direct
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const addYouTubeVideo = async () => {
    if (!user || !youtubeUrl.trim()) return;

    setLoading(true);
    try {
      const videoId = extractVideoId(youtubeUrl.trim());
      if (!videoId) {
        throw new Error("URL YouTube invalide. Utilisez le format: https://www.youtube.com/watch?v=VIDEO_ID");
      }

      // Vérifier si la vidéo existe déjà
      const { data: existing } = await supabase
        .from('videos')
        .select('id')
        .eq('platform_video_id', videoId)
        .eq('platform', 'youtube')
        .single();

      if (existing) {
        throw new Error("Cette vidéo est déjà dans votre liste");
      }

      // Récupérer les informations de la vidéo depuis l'API YouTube via notre edge function
      const { data: videoInfoData, error: videoInfoError } = await supabase.functions.invoke('get-video-info', {
        body: { videoId }
      });

      if (videoInfoError || !videoInfoData.video) {
        throw new Error("Impossible de récupérer les informations de la vidéo");
      }

      const video = videoInfoData.video;

      // Ajouter la vidéo à la base de données
      const { error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: video.snippet.title,
          description: video.snippet.description,
          platform: 'youtube',
          platform_video_id: videoId,
          thumbnail_url: video.snippet.thumbnails?.default?.url,
          published_at: video.snippet.publishedAt,
          status: 'active',
        });

      if (error) throw error;

      setYoutubeUrl("");
      await loadVideos();
      onVideoAdded?.();
      
      toast({
        title: "Vidéo ajoutée",
        description: `"${video.snippet.title}" a été ajoutée à votre liste`,
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      await loadVideos();
      toast({
        title: "Vidéo supprimée",
        description: "La vidéo a été retirée de votre liste",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des vidéos YouTube</CardTitle>
        <CardDescription>
          Ajoutez vos vidéos YouTube pour suivre leurs analytics automatiquement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire d'ajout */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="youtube-url">URL ou ID de la vidéo YouTube</Label>
            <Input
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou juste l'ID"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addYouTubeVideo} 
              disabled={loading || !youtubeUrl.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Liste des vidéos */}
        {videos.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium">Vidéos surveillées ({videos.length})</h4>
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h5 className="font-medium truncate">{video.title}</h5>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      YouTube
                    </Badge>
                    <span>ID: {video.platform_video_id}</span>
                    <span>•</span>
                    <span>
                      {new Date(video.published_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.platform_video_id}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune vidéo YouTube ajoutée</p>
            <p className="text-sm">Ajoutez vos vidéos pour commencer le suivi des analytics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}