import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, Users, Heart, Clock, Download, LogIn } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoginDialog } from "@/components/ui/login-dialog";
import { YouTubeManager } from "@/components/ui/youtube-manager";
import { YouTubeVideoManager } from "@/components/ui/youtube-video-manager";

interface AnalyticsData {
  kpis: {
    totalViews: number;
    avgEngagement: number;
    subscribersGained: number;
    avgWatchTime: number;
  };
  timeseries: Array<{ date: string; views: number; engagement: number }>;
  platforms: Array<{ name: string; views: number; subscribers: number; engagement: number }>;
  engagement: Array<{ name: string; value: number; color: string }>;
}

export default function Analytics() {
  const [period, setPeriod] = useState("30d");
  const [selectedPlatforms, setSelectedPlatforms] = useState("all");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Check auth status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) setLoading(false);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchAnalyticsData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchAnalyticsData = async () => {
    if (!user?.id) {
      console.log('No user authenticated');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch videos and analytics data for the current user
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          platform,
          duration,
          published_at,
          analytics_data (
            date,
            views,
            likes,
            comments,
            shares,
            watch_time_seconds,
            subscribers_gained
          )
        `)
        .eq('status', 'active')
        .eq('user_id', user.id);

      if (videosError) throw videosError;

      if (!videos || videos.length === 0) {
        // No data available - return empty structure
        setData({
          kpis: {
            totalViews: 0,
            avgEngagement: 0,
            subscribersGained: 0,
            avgWatchTime: 0,
          },
          timeseries: [],
          platforms: [],
          engagement: []
        });
        setLoading(false);
        return;
      }

      // Process the data
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalWatchTime = 0;
      let totalSubscribers = 0;
      
      const platformStats: Record<string, { views: number; subscribers: number; interactions: number }> = {};
      const timeseriesMap: Record<string, { views: number; interactions: number }> = {};

      videos.forEach(video => {
        const platform = video.platform === 'youtube' ? 'YouTube' : 'Upload interne';
        
        if (!platformStats[platform]) {
          platformStats[platform] = { views: 0, subscribers: 0, interactions: 0 };
        }

        if (video.analytics_data) {
          video.analytics_data.forEach((analytics: any) => {
            totalViews += analytics.views || 0;
            totalLikes += analytics.likes || 0;
            totalComments += analytics.comments || 0;
            totalShares += analytics.shares || 0;
            totalWatchTime += analytics.watch_time_seconds || 0;
            totalSubscribers += analytics.subscribers_gained || 0;

            platformStats[platform].views += analytics.views || 0;
            platformStats[platform].subscribers += analytics.subscribers_gained || 0;
            platformStats[platform].interactions += (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0);

            // Build timeseries data (last 7 days)
            const date = new Date(analytics.date);
            const dateKey = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            
            if (!timeseriesMap[dateKey]) {
              timeseriesMap[dateKey] = { views: 0, interactions: 0 };
            }
            timeseriesMap[dateKey].views += analytics.views || 0;
            timeseriesMap[dateKey].interactions += (analytics.likes || 0) + (analytics.comments || 0) + (analytics.shares || 0);
          });
        }
      });

      // Calculate engagement rate
      const avgEngagement = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;
      const avgWatchTime = totalViews > 0 ? totalWatchTime / totalViews : 0;

      // Build final data structure
      const analyticsData: AnalyticsData = {
        kpis: {
          totalViews,
          avgEngagement: Math.round(avgEngagement * 100) / 100,
          subscribersGained: totalSubscribers,
          avgWatchTime: Math.round(avgWatchTime),
        },
        timeseries: Object.entries(timeseriesMap)
          .map(([date, stats]) => ({
            date,
            views: stats.views,
            engagement: stats.views > 0 ? Math.round((stats.interactions / stats.views) * 100) : 0
          }))
          .slice(-7), // Last 7 days
        platforms: Object.entries(platformStats).map(([name, stats]) => ({
          name,
          views: stats.views,
          subscribers: stats.subscribers,
          engagement: stats.views > 0 ? Math.round((stats.interactions / stats.views) * 100) : 0
        })),
        engagement: [
          { name: "Likes", value: totalLikes, color: "#22c55e" },
          { name: "Commentaires", value: totalComments, color: "#3b82f6" },
          { name: "Partages", value: totalShares, color: "#f59e0b" },
        ]
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [period, user]);

  // Show login required message if not authenticated
  if (!user && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Tableau de bord et statistiques de performance
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <LogIn className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Connexion requise</p>
              <p className="mb-4">Connectez-vous pour voir vos statistiques d'analytics.</p>
              <LoginDialog onAuthSuccess={() => setLoading(true)}>
                <Button>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              </LoginDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiCards = data ? [
    {
      title: "Vues totales",
      value: formatNumber(data.kpis.totalViews),
      change: "+12.5%",
      trend: "up" as const,
      icon: Eye,
    },
    {
      title: "Engagement moyen",
      value: `${data.kpis.avgEngagement}%`,
      change: "+2.1%",
      trend: "up" as const,
      icon: Heart,
    },
    {
      title: "Abonnés gagnés",
      value: formatNumber(data.kpis.subscribersGained),
      change: "+8.7%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Temps moyen",
      value: formatTime(data.kpis.avgWatchTime),
      change: "-1.2%",
      trend: "down" as const,
      icon: Clock,
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Chargement des données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Erreur lors du chargement des données
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Tableau de bord et statistiques de performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Gestionnaire YouTube */}
      <YouTubeManager onConnectionChange={() => fetchAnalyticsData()} />
      
      {/* Gestionnaire de vidéos YouTube */}
      <YouTubeVideoManager onVideoAdded={() => fetchAnalyticsData()} />

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedPlatforms} onValueChange={setSelectedPlatforms}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Plateformes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les plateformes</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="internal">Upload interne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-sm">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {kpi.change}
                </span>
                <span className="text-muted-foreground ml-1">vs période précédente</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Évolution des vues */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des vues</CardTitle>
            <CardDescription>Vues dans le temps (derniers 7 jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeseries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par plateforme */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plateforme</CardTitle>
            <CardDescription>Vues par source de contenu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.platforms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Types d'engagement</CardTitle>
            <CardDescription>Répartition des interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.engagement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.engagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tableau comparatif */}
        <Card>
          <CardHeader>
            <CardTitle>Comparatif plateformes</CardTitle>
            <CardDescription>Performance détaillée par source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.platforms.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(platform.views)} vues • {platform.subscribers} abonnés
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{platform.engagement}% engagement</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {platform.name === "YouTube" ? "+12%" : "+5%"} croissance
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* État vide si pas de données */}
      {false && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune donnée disponible</p>
              <p>Connectez YouTube pour commencer à voir vos analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}