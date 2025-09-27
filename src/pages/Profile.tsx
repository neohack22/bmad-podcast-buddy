import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, ExternalLink, Youtube, Twitter, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "Créateur Podcast",
    bio: "Passionné de contenu audio et créateur de podcasts depuis 5 ans. Spécialisé dans les interviews tech et entrepreneuriat.",
    avatarUrl: "",
    socialLinks: [
      { platform: "YouTube", url: "https://youtube.com/@monpodcast", stats: "12.5K abonnés" },
      { platform: "Twitter", url: "https://twitter.com/monpodcast", stats: "8.2K followers" },
      { platform: "Website", url: "https://monpodcast.com", stats: "Site officiel" }
    ]
  });

  const handleSaveProfile = () => {
    // Simulation sauvegarde
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
    setIsEditModalOpen(false);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "YouTube": return Youtube;
      case "Twitter": return Twitter;
      case "Website": return Globe;
      default: return ExternalLink;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-glow">
              <AvatarImage src={profileData.avatarUrl} />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                CP
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-3xl font-bold">{profileData.displayName}</h1>
                <Badge variant="secondary" className="w-fit">
                  Créateur Vérifié
                </Badge>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {profileData.bio}
              </p>
              
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Éditer Profil
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                    <DialogDescription>
                      Mettez à jour vos informations publiques
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nom d'utilisateur</Label>
                      <Input
                        id="displayName"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Sauvegarder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <div className="grid md:grid-cols-3 gap-6">
        {profileData.socialLinks.map((link, index) => {
          const IconComponent = getSocialIcon(link.platform);
          
          return (
            <Card key={index} className="hover:shadow-glow transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{link.platform}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground font-mono truncate">
                  {link.url}
                </p>
                <p className="text-sm font-medium text-primary">
                  {link.stats}
                </p>
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <ExternalLink className="h-3 w-3" />
                  Voir le profil
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de contenu</CardTitle>
            <CardDescription>Vue d'ensemble de votre activité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Transcriptions</span>
              <Badge variant="outline">23 terminées</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Scripts générés</span>
              <Badge variant="outline">15 créés</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Temps économisé</span>
              <Badge variant="outline" className="bg-success text-success-foreground">12h 30min</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de visibilité</CardTitle>
            <CardDescription>Gérez la visibilité de votre profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Profil public</span>
              <Badge className="bg-success text-success-foreground">Activé</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Liens sociaux</span>
              <Badge className="bg-success text-success-foreground">Visibles</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Statistiques</span>
              <Badge variant="outline">Privées</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}