import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, Users, Heart, Clock, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = {
  kpis: {
    totalViews: 15230,
    avgEngagement: 12.5,
    subscribersGained: 320,
    avgWatchTime: 245,
  },
  timeseries: [
    { date: "01/09", views: 500, engagement: 10 },
    { date: "02/09", views: 630, engagement: 12 },
    { date: "03/09", views: 480, engagement: 8 },
    { date: "04/09", views: 720, engagement: 15 },
    { date: "05/09", views: 890, engagement: 18 },
    { date: "06/09", views: 650, engagement: 14 },
    { date: "07/09", views: 780, engagement: 16 },
  ],
  platforms: [
    { name: "YouTube", views: 12500, subscribers: 280, engagement: 15 },
    { name: "Upload interne", views: 2730, subscribers: 40, engagement: 8 },
  ],
  engagement: [
    { name: "Likes", value: 1250, color: "#22c55e" },
    { name: "Commentaires", value: 380, color: "#3b82f6" },
    { name: "Partages", value: 120, color: "#f59e0b" },
  ],
};

export default function Analytics() {
  const [period, setPeriod] = useState("30d");
  const [selectedPlatforms, setSelectedPlatforms] = useState("all");

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

  const kpiCards = [
    {
      title: "Vues totales",
      value: formatNumber(mockData.kpis.totalViews),
      change: "+12.5%",
      trend: "up",
      icon: Eye,
    },
    {
      title: "Engagement moyen",
      value: `${mockData.kpis.avgEngagement}%`,
      change: "+2.1%",
      trend: "up",
      icon: Heart,
    },
    {
      title: "Abonnés gagnés",
      value: formatNumber(mockData.kpis.subscribersGained),
      change: "+8.7%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Temps moyen",
      value: formatTime(mockData.kpis.avgWatchTime),
      change: "-1.2%",
      trend: "down",
      icon: Clock,
    },
  ];

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
              <LineChart data={mockData.timeseries}>
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
              <BarChart data={mockData.platforms}>
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
                  data={mockData.engagement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.engagement.map((entry, index) => (
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
              {mockData.platforms.map((platform) => (
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