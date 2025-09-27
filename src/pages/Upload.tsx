import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload as UploadIcon, File, Play, Pause, MoreVertical, Download, Scissors, Merge, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "queued" | "uploading" | "processing" | "ready" | "failed";
  progress: number;
  uploadedSize?: number;
  error?: string;
}

interface ExportPreset {
  id: string;
  name: string;
  format: string;
  quality: string;
  description: string;
}

const exportPresets: ExportPreset[] = [
  { id: "mp3-128", name: "MP3 128kbps", format: "mp3", quality: "128", description: "Qualité standard" },
  { id: "mp3-192", name: "MP3 192kbps", format: "mp3", quality: "192", description: "Bonne qualité" },
  { id: "mp3-320", name: "MP3 320kbps", format: "mp3", quality: "320", description: "Haute qualité" },
  { id: "wav", name: "WAV", format: "wav", quality: "lossless", description: "Sans perte" },
  { id: "mp4-720", name: "MP4 720p", format: "mp4", quality: "720p", description: "HD" },
  { id: "mp4-1080", name: "MP4 1080p", format: "mp4", quality: "1080p", description: "Full HD" },
  { id: "webm", name: "WebM", format: "webm", quality: "1080p", description: "Web optimisé" },
];

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("mp3-192");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList: File[]) => {
    const supportedTypes = ["video/mp4", "video/mov", "video/webm", "audio/mp3", "audio/wav", "audio/mpeg"];
    
    const newFiles: UploadFile[] = fileList
      .filter(file => {
        if (!supportedTypes.includes(file.type)) {
          toast({
            title: "Format non supporté",
            description: `Le fichier "${file.name}" n'est pas supporté. Utilisez mp4, mov, mp3, wav.`,
            variant: "destructive",
          });
          return false;
        }
        
        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
          toast({
            title: "Fichier trop volumineux",
            description: `Le fichier "${file.name}" dépasse la limite de 2 Go.`,
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      })
      .map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "queued" as const,
        progress: 0,
      }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Simuler l'upload
    newFiles.forEach(file => simulateUpload(file.id));
  };

  const simulateUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "uploading" as const } : f
    ));

    // Simuler progress
    const interval = setInterval(() => {
      setFiles(prev => {
        const file = prev.find(f => f.id === fileId);
        if (!file || file.status !== "uploading") {
          clearInterval(interval);
          return prev;
        }

        const newProgress = Math.min(file.progress + Math.random() * 10, 100);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Simuler le processing
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, status: "processing" as const } : f
            ));
            
            // Simuler fin de processing
            setTimeout(() => {
              setFiles(prev => prev.map(f => 
                f.id === fileId ? { ...f, status: "ready" as const } : f
              ));
              
              toast({
                title: "Upload terminé",
                description: `"${file.name}" est prêt pour le montage.`,
              });
            }, 2000);
          }, 1000);
        }
        
        return prev.map(f => 
          f.id === fileId ? { ...f, progress: newProgress } : f
        );
      });
    }, 500);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleExport = () => {
    const preset = exportPresets.find(p => p.id === selectedPreset);
    if (!preset) return;

    setIsExporting(true);
    
    toast({
      title: "Export en cours",
      description: `Export en ${preset.name}... vous serez notifié à la fin`,
    });

    // Simuler export
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export terminé",
        description: "Export terminé — prêt au téléchargement",
      });
    }, 3000);
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "queued": return "secondary";
      case "uploading": return "default";
      case "processing": return "default";
      case "ready": return "default";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: UploadFile["status"]) => {
    switch (status) {
      case "queued": return "En attente";
      case "uploading": return "Téléversement";
      case "processing": return "Traitement";
      case "ready": return "Prêt";
      case "failed": return "Échec";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload & Montage</h1>
        <p className="text-muted-foreground">
          Importez vos fichiers et réalisez un montage léger avant export
        </p>
      </div>

      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle>Import de fichiers</CardTitle>
          <CardDescription>
            Glissez-déposez vos fichiers ou cliquez pour sélectionner (max 2 Go par fichier)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragging ? "Déposez vos fichiers ici" : "Déposez vos fichiers ici ou cliquez pour sélectionner"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Formats supportés: MP4, MOV, WebM, MP3, WAV
            </p>
            
            <input
              type="file"
              multiple
              accept="video/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Sélectionner des fichiers
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers en cours</CardTitle>
            <CardDescription>Suivi des uploads et traitements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                    
                    {(file.status === "uploading" || file.status === "processing") && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.status === "uploading" ? "Téléversement" : "Traitement"}... {Math.round(file.progress)}%
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={getStatusColor(file.status)}>
                    {getStatusText(file.status)}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.status === "ready" && (
                        <>
                          <DropdownMenuItem>
                            <Scissors className="h-4 w-4 mr-2" />
                            Couper
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Merge className="h-4 w-4 mr-2" />
                            Fusionner
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => removeFile(file.id)} className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Éditeur simple (placeholder) */}
      {files.some(f => f.status === "ready") && (
        <Card>
          <CardHeader>
            <CardTitle>Éditeur léger</CardTitle>
            <CardDescription>Montage basique: couper, fusionner, ajuster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Timeline placeholder */}
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Timeline de montage - À implémenter</p>
              </div>
              
              {/* Outils de montage */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim
                </Button>
                <Button variant="outline" size="sm">
                  <Merge className="h-4 w-4 mr-2" />
                  Split
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export */}
      {files.some(f => f.status === "ready") && (
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>Choisissez le format et la qualité d'export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preset d'export</label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name} - {preset.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Export en cours...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </>
                  )}
                </Button>
                
                {isExporting && (
                  <Button variant="outline" onClick={() => setIsExporting(false)}>
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}