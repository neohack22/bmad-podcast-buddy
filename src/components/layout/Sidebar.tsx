import { useState } from "react";
import { 
  User, 
  FileText, 
  Wand2, 
  Video, 
  Upload, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Profil", href: "/profile", icon: User },
  { name: "Transcription", href: "/transcription", icon: FileText },
  { name: "Scripts IA", href: "/scripts", icon: Wand2 },
  { name: "Vidéothèque", href: "/library", icon: Video },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Configuration", href: "/setup", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              PodcastStudio
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <TooltipProvider>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const isScriptsIA = item.href === "/scripts";
            const isProfil = item.href === "/profile";
            const isDisabled = !isScriptsIA && !isProfil;
            
            const buttonContent = (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "px-2",
                  isDisabled && "opacity-75"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.name}</span>
                    {isDisabled && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Bientôt
                      </span>
                    )}
                  </div>
                )}
              </Button>
            );

            if (isDisabled) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Fonctionnalité en préversion - bientôt disponible</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-sidebar-accent rounded-lg">
            <p className="text-xs text-sidebar-accent-foreground">
              Créez du contenu de qualité avec l'IA
            </p>
          </div>
        </div>
      )}
    </div>
  );
}