import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Wand2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Nouvelle Transcription",
      description: "Transcrivez une vidéo YouTube",
      icon: FileText,
      action: () => navigate("/transcription"),
      gradient: "bg-gradient-primary"
    },
    {
      title: "Générer un Script",
      description: "Créez du contenu avec l'IA",
      icon: Wand2,
      action: () => navigate("/scripts"),
      gradient: "bg-gradient-accent"
    },
    {
      title: "Uploader un Fichier",
      description: "Ajoutez vos médias",
      icon: Upload,
      action: () => navigate("/upload"),
      gradient: "bg-secondary"
    }
  ];

  const stats = [
    { label: "Transcriptions", value: "12", trend: "+3 cette semaine" },
    { label: "Scripts générés", value: "8", trend: "+2 cette semaine" },
    { label: "Fichiers stockés", value: "24", trend: "1.2 GB utilisés" },
    { label: "Temps économisé", value: "6h", trend: "Ce mois-ci" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Bienvenue dans PodcastStudio
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Votre plateforme tout-en-un pour créer, transcrire et optimiser vos contenus podcast et vidéo
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-glow transition-shadow cursor-pointer group" onClick={action.action}>
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full group-hover:bg-muted">
                Commencer →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Transcription terminée</p>
                <p className="text-sm text-muted-foreground">Interview Saison 2 - Episode 5</p>
              </div>
              <span className="text-sm text-muted-foreground">Il y a 2h</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Wand2 className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Script généré</p>
                <p className="text-sm text-muted-foreground">Intro d'épisode - Version dynamique</p>
              </div>
              <span className="text-sm text-muted-foreground">Hier</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}