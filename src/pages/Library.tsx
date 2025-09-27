import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Upload, Play, MoreVertical, FileText, Wand2, BarChart3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  duration: number;
  resolution: string;
  size_mb: number;
  tags: string[];
  status: {
    transcribed: boolean;
    analyzed: boolean;
  };
  created_at: string;
  preview_url: string;
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Interview Saison 2 - Episode 5",
    duration: 3600,
    resolution: "1080p",
    size_mb: 500,
    tags: ["interview", "saison2"],
    status: { transcribed: true, analyzed: false },
    created_at: "2025-09-25T11:30:00Z",
    preview_url: "/placeholder.svg",
  },
  {
    id: "2", 
    title: "Podcast Tech - IA et Futur",
    duration: 2400,
    resolution: "720p",
    size_mb: 300,
    tags: ["tech", "ia"],
    status: { transcribed: false, analyzed: false },
    created_at: "2025-09-24T14:20:00Z",
    preview_url: "/placeholder.svg",
  },
];

export default function Library() {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDuration, setFilterDuration] = useState("all");
  const [filterQuality, setFilterQuality] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { toast } = useToast();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} Go`;
    }
    return `${mb} Mo`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDuration = filterDuration === "all" || 
                           (filterDuration === "short" && video.duration < 1800) ||
                           (filterDuration === "medium" && video.duration >= 1800 && video.duration < 3600) ||
                           (filterDuration === "long" && video.duration >= 3600);
    
    const matchesQuality = filterQuality === "all" || video.resolution === filterQuality;
    
    return matchesSearch && matchesDuration && matchesQuality;
  });

  const handleAction = (action: string, video: Video) => {
    switch (action) {
      case "transcribe":
        toast({
          title: "Transcription lancée",
          description: `Transcription de "${video.title}" en cours...`,
        });
        break;
      case "script":
        toast({
          title: "Génération de script",
          description: `Génération d'un script pour "${video.title}"...`,
        });
        break;
      case "analyze":
        toast({
          title: "Analyse lancée",
          description: `Analyse de "${video.title}" en cours...`,
        });
        break;
      case "delete":
        setVideos(videos.filter(v => v.id !== video.id));
        toast({
          title: "Vidéo supprimée",
          description: "Vidéo supprimée avec succès",
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Vidéothèque</h1>
          <p className="text-muted-foreground">
            Gérez et organisez tous vos contenus vidéo et audio
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Uploader nouveau contenu
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes durées</SelectItem>
                <SelectItem value="short">Court (&lt; 30m)</SelectItem>
                <SelectItem value="medium">Moyen (30m-1h)</SelectItem>
                <SelectItem value="long">Long (&gt; 1h)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Qualité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes qualités</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="4K">4K</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des vidéos */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {videos.length === 0 ? (
                <>
                  <p className="text-lg font-medium">Votre vidéothèque est vide</p>
                  <p>Importez vos premières vidéos pour commencer.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Aucun résultat</p>
                  <p>Essayez de modifier vos critères de recherche.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <CardDescription>
                      {formatDate(video.created_at)} • {formatDuration(video.duration)}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction("transcribe", video)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Transcrire
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("script", video)}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Générer script
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("analyze", video)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyser
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleAction("delete", video)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Preview */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={video.preview_url} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/50"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{video.resolution}</span>
                  <span>{formatSize(video.size_mb)}</span>
                </div>

                {/* Tags et statuts */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant={video.status.transcribed ? "default" : "outline"} className="text-xs">
                      {video.status.transcribed ? "Transcrit" : "Non transcrit"}
                    </Badge>
                    <Badge variant={video.status.analyzed ? "default" : "outline"} className="text-xs">
                      {video.status.analyzed ? "Analysé" : "Non analysé"}
                    </Badge>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAction("transcribe", video)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Transcrire
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAction("script", video)}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Script
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}