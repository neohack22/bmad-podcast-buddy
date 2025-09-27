import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Settings, Youtube, Database, Zap } from "lucide-react";

export default function Setup() {
  const features = [
    {
      title: "Base de données Analytics",
      description: "Tables pour stocker les vidéos et leurs statistiques",
      status: "completed",
      icon: Database,
    },
    {
      title: "Authentification YouTube",
      description: "Connexion OAuth pour accéder aux données YouTube",
      status: "completed",
      icon: Youtube,
    },
    {
      title: "Synchronisation automatique",
      description: "Récupération périodique des analytics via cron job",
      status: "completed",
      icon: Zap,
    },
    {
      title: "Configuration des secrets",
      description: "YOUTUBE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET",
      status: "pending",
      icon: Settings,
    },
  ];

  const nextSteps = [
    {
      step: 1,
      title: "Configurer l'authentification Google",
      description: "Créer un projet Google Cloud et configurer OAuth",
      action: "Suivre le guide",
      url: "https://console.cloud.google.com/",
    },
    {
      step: 2,
      title: "Obtenir une clé API YouTube",
      description: "Activer l'API YouTube Data v3 dans Google Cloud",
      action: "Obtenir la clé",
      url: "https://console.cloud.google.com/apis/credentials",
    },
    {
      step: 3,
      title: "Configurer les redirections",
      description: "Ajouter l'URL de callback dans Google Cloud Console",
      action: "Configurer",
      url: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuration Analytics</h1>
        <p className="text-muted-foreground">
          État de l'installation et prochaines étapes pour les analytics YouTube
        </p>
      </div>

      {/* État des fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités implémentées</CardTitle>
          <CardDescription>
            Système d'analytics avec intégration YouTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <feature.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{feature.title}</h4>
                    <Badge 
                      variant={feature.status === 'completed' ? 'default' : 'secondary'}
                      className={feature.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {feature.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Terminé
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prochaines étapes */}
      <Card>
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
          <CardDescription>
            Configuration requise pour activer les analytics YouTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextSteps.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  {step.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(step.url, '_blank')}
                    >
                      {step.action}
                    </Button>
                  )}
                  {!step.url && step.step === 3 && (
                    <div className="text-sm text-muted-foreground">
                      URL de callback : <code className="bg-muted px-1 rounded">
                        https://nijagdmfvadmpzwshvll.supabase.co/functions/v1/youtube-oauth
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Guide de configuration Google Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Créer un projet Google Cloud</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Aller sur <a href="https://console.cloud.google.com/" target="_blank" className="text-primary hover:underline">Google Cloud Console</a></li>
              <li>• Créer un nouveau projet ou sélectionner un existant</li>
              <li>• Activer les APIs YouTube Data API v3 et YouTube Analytics API</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Configurer OAuth 2.0</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Aller dans "APIs & Services" → "Credentials"</li>
              <li>• Créer des "OAuth 2.0 Client IDs"</li>
              <li>• Type d'application : Application Web</li>
              <li>• URL autorisées : Ajouter votre domaine Lovable</li>
              <li>• URL de redirection : <code className="bg-muted px-1 rounded">https://nijagdmfvadmpzwshvll.supabase.co/functions/v1/youtube-oauth</code></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Obtenir les clés</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Client ID : Copier dans les secrets Lovable</li>
              <li>• Client Secret : Copier dans les secrets Lovable</li>
              <li>• Clé API : Créer une clé API et la copier dans les secrets</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Important :</strong> Les secrets ont déjà été configurés dans votre projet Lovable Cloud. 
              Vous devez maintenant les remplir avec vos vraies valeurs depuis Google Cloud Console.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}