import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Save, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScriptVariant {
  variant: string;
  title: string;
  content: string;
}

interface GeneratedScript {
  request_id: string;
  items: ScriptVariant[];
  latency_ms: number;
}

const templates = [
  { value: "intro", label: "Intro Podcast" },
  { value: "outline", label: "Plan détaillé" },
  { value: "description", label: "Description YouTube" },
  { value: "title", label: "Titre accrocheur" },
  { value: "show_notes", label: "Show Notes" },
];

const tones = [
  { value: "neutre", label: "Neutre" },
  { value: "energique", label: "Énergique" },
  { value: "pedagogique", label: "Pédagogique" },
  { value: "humoristique", label: "Humoristique" },
  { value: "expert", label: "Expert" },
];

const lengths = [
  { value: "short", label: "Court" },
  { value: "medium", label: "Moyen" },
  { value: "long", label: "Long" },
];

const languages = [
  { value: "auto", label: "Automatique" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
];

export default function Scripts() {
  const [template, setTemplate] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("neutre");
  const [length, setLength] = useState("medium");
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [activeVariant, setActiveVariant] = useState("A");
  const { toast } = useToast();

  const generateScript = async () => {
    if (!template || !topic.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez sélectionner un template et saisir un sujet.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const keywordArray = keywords.split(",").map(k => k.trim()).filter(k => k.length > 0);
      
      const { data, error } = await supabase.functions.invoke('ai', {
        body: {
          template,
          inputs: {
            topic: topic.trim(),
            tone,
            length,
            keywords: keywordArray,
            language,
          },
          variants: 2,
        },
      });

      if (error) throw error;

      setGeneratedScript({
        request_id: data.request_id || crypto.randomUUID(),
        items: data.variants || [
          { variant: "A", title: data.title || "Script généré", content: data.response || data.content || "" },
        ],
        latency_ms: data.latency_ms || 0,
      });

      setActiveVariant("A");
      
      toast({
        title: "Script généré",
        description: "Script généré en quelques secondes.",
      });
    } catch (error) {
      console.error("Erreur génération script:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le script. Réessayez ou simplifiez votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copié",
      description: "Le contenu a été copié dans le presse-papier.",
    });
  };

  const downloadScript = (content: string, title: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement",
      description: "Le script a été téléchargé.",
    });
  };

  const activeScript = generatedScript?.items.find(item => item.variant === activeVariant);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Génération de Scripts IA</h1>
        <p className="text-muted-foreground">
          Créez des scripts professionnels avec l'aide de l'intelligence artificielle
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Choisissez le type de script à générer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((t) => (
              <Button
                key={t.value}
                variant={template === t.value ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setTemplate(t.value)}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {t.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Paramètres */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Personnalisez votre script</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Sujet / Contexte</Label>
              <Textarea
                id="topic"
                placeholder="Décrivez le thème ou collez un résumé de l'épisode"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Ton</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Longueur</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Mots-clés</Label>
              <Input
                id="keywords"
                placeholder="podcast, matériel, audience"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateScript} 
                disabled={isGenerating || !template || !topic.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer
                  </>
                )}
              </Button>
              
              {generatedScript && (
                <Button 
                  variant="outline" 
                  onClick={generateScript}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>Scripts générés avec différentes variantes</CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedScript ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun script encore créé</p>
                <p className="text-sm">Générez votre premier script pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={activeVariant} onValueChange={setActiveVariant}>
                  <TabsList className="grid w-full grid-cols-2">
                    {generatedScript.items.map((item) => (
                      <TabsTrigger key={item.variant} value={item.variant}>
                        Variante {item.variant}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {generatedScript.items.map((item) => (
                    <TabsContent key={item.variant} value={item.variant} className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(item.content)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadScript(item.content, item.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                {generatedScript.latency_ms > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Généré en {generatedScript.latency_ms}ms
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}