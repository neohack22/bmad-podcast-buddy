import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Youtube, Unlink2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface YouTubeConnection {
  channel_id: string;
  channel_name: string;
  connected_at: string;
}

interface YouTubeManagerProps {
  onConnectionChange?: () => void;
}

export function YouTubeManager({ onConnectionChange }: YouTubeManagerProps) {
  const [connection, setConnection] = useState<YouTubeConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await checkConnection();
      }
    };
    checkUser();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_tokens')
        .select('channel_id, channel_name, created_at')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setConnection({
          channel_id: data.channel_id,
          channel_name: data.channel_name,
          connected_at: data.created_at,
        });
      } else {
        setConnection(null);
      }
    } catch (error) {
      console.error('Erreur vérification connexion YouTube:', error);
    }
  };

  const connectYouTube = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Demander l'URL d'autorisation
      const { data: functionData, error: functionError } = await supabase.functions.invoke('youtube-oauth', {
        body: { 
          action: 'get_auth_url',
          state: user.id 
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Rediriger vers l'autorisation YouTube
      window.open(functionData.authUrl, '_blank', 'width=500,height=600');

      // Vérifier périodiquement si la connexion est établie
      const checkInterval = setInterval(async () => {
        await checkConnection();
        if (connection) {
          clearInterval(checkInterval);
          onConnectionChange?.();
          toast({
            title: "Connexion réussie",
            description: "Votre compte YouTube est maintenant connecté",
          });
        }
      }, 2000);

      // Arrêter la vérification après 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        setLoading(false);
      }, 120000);

    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const disconnectYouTube = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('youtube-oauth', {
        body: { 
          action: 'disconnect',
          user_id: user.id 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setConnection(null);
      onConnectionChange?.();
      toast({
        title: "Déconnexion réussie",
        description: "Votre compte YouTube a été déconnecté",
      });

    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncAnalytics = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sync-analytics', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      onConnectionChange?.();
      toast({
        title: "Synchronisation terminée",
        description: "Vos analytics YouTube ont été mises à jour",
      });

    } catch (error: any) {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Connexion YouTube
        </CardTitle>
        <CardDescription>
          Connectez votre compte YouTube pour synchroniser automatiquement vos analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{connection.channel_name}</p>
                <p className="text-sm text-muted-foreground">
                  ID: {connection.channel_id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Connecté le {new Date(connection.connected_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connecté
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={syncAnalytics}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Synchroniser
              </Button>
              
              <Button
                onClick={disconnectYouTube}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Unlink2 className="h-4 w-4 mr-2" />
                Déconnecter
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Aucun compte YouTube connecté
            </p>
            <Button
              onClick={connectYouTube}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Youtube className="h-4 w-4 mr-2" />
              {loading ? 'Connexion...' : 'Connecter YouTube'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}