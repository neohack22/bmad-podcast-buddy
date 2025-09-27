import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Copy, Play, Pause, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionJob {
  id: string;
  title: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  duration?: string;
  createdAt: string;
}

export default function Transcription() {
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("srt");
  const [isPrivate, setIsPrivate] = useState(true);
  const [jobs, setJobs] = useState<TranscriptionJob[]>([
    {
      id: "1",
      title: "Interview Entrepreneur Tech - Episode 12",
      status: "completed",
      progress: 100,
      duration: "45:23",
      createdAt: "2025-01-15T10:30:00Z"
    },
    {
      id: "2", 
      title: "Podcast Marketing Digital",
      status: "processing",
      progress: 65,
      duration: "32:17",
      createdAt: "2025-01-15T14:15:00Z"
    }
  ]);

  const [selectedJob, setSelectedJob] = useState<TranscriptionJob | null>(jobs[0]);
  const [mockTranscript] = useState(`
[00:00:01] Bonjour et bienvenue dans ce nouvel épisode de notre podcast tech.
[00:00:05] Aujourd'hui, nous recevons Sarah, fondatrice d'une startup innovante.
[00:00:12] Sarah, peux-tu nous parler de ton parcours ?
[00:00:15] Bien sûr ! J'ai commencé ma carrière en tant que développeuse...
  `);

  const handleStartTranscription = () => {
    if (!youtubeUrl) {
      toast({
        title: "URL manquante",
        description: "Veuillez saisir une URL YouTube valide",
        variant: "destructive"
      });
      return;
    }

    const newJob: TranscriptionJob = {
      id: Date.now().toString(),
      title: "Nouvelle transcription",
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);
    setYoutubeUrl("");
    
    toast({
      title: "Transcription lancée",
      description: "Votre transcription a été ajoutée à la file d'attente."
    });

    // Simulation du progress
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, status: "processing" as const } : job
      ));
    }, 1000);
  };

  const getStatusIcon = (status: TranscriptionJob["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-warning" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: TranscriptionJob["status"]) => {
    const variants = {
      queued: "secondary",
      processing: "default", 
      completed: "secondary",
      failed: "destructive"
    } as const;

    const labels = {
      queued: "En attente",
      processing: "En cours",
      completed: "Terminé",
      failed: "Échec"
    };

    return (
      <Badge variant={variants[status]} className="gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Transcription Automatique
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transformez vos vidéos YouTube en transcriptions texte avec sous-titres SRT/VTT
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nouvelle Transcription
              </CardTitle>
              <CardDescription>
                Configurez et lancez votre transcription
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">URL YouTube</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Langue cible</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Détection automatique</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="es">Espagnol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format de sortie</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="srt">SRT (sous-titres)</SelectItem>
                    <SelectItem value="vtt">VTT (WebVTT)</SelectItem>
                    <SelectItem value="txt">TXT (texte brut)</SelectItem>
                    <SelectItem value="json">JSON (structuré)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="privacy"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="privacy">Transcription privée</Label>
              </div>

              <Button onClick={handleStartTranscription} className="w-full">
                Transcrire
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Jobs & Résultats */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs">Jobs en cours</TabsTrigger>
              <TabsTrigger value="result">Résultat</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transcriptions</CardTitle>
                  <CardDescription>Suivez l'avancement de vos transcriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{job.title}</h4>
                          {getStatusBadge(job.status)}
                        </div>
                        
                        {job.status === "processing" && (
                          <Progress value={job.progress} className="h-2" />
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{new Date(job.createdAt).toLocaleString()}</span>
                          {job.duration && <span>{job.duration}</span>}
                          {job.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              Voir résultat
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {selectedJob ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedJob.title}</CardTitle>
                        <CardDescription>Transcription terminée</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Copy className="h-4 w-4" />
                          Copier
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="transcript" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="transcript">Transcript</TabsTrigger>
                        <TabsTrigger value="srt">SRT</TabsTrigger>
                        <TabsTrigger value="meta">Métadonnées</TabsTrigger>
                      </TabsList>

                      <TabsContent value="transcript">
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {mockTranscript}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="srt">
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
{`1
00:00:01,000 --> 00:00:05,000
Bonjour et bienvenue dans ce nouvel épisode de notre podcast tech.

2
00:00:05,000 --> 00:00:12,000
Aujourd'hui, nous recevons Sarah, fondatrice d'une startup innovante.`}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="meta">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Durée</p>
                              <p className="text-lg">{selectedJob.duration}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Langue détectée</p>
                              <p className="text-lg">Français</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Mots</p>
                              <p className="text-lg">1,247</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Confiance</p>
                              <p className="text-lg">94%</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun résultat sélectionné</h3>
                    <p className="text-muted-foreground">
                      Sélectionnez une transcription terminée pour voir le résultat
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}