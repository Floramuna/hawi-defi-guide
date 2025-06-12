
import { Brain, MessageCircle, BookOpen, TrendingUp, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const menuItems = [
    { icon: MessageCircle, label: "Chat", active: true },
    { icon: BookOpen, label: "Learning Paths", active: false },
    { icon: TrendingUp, label: "Portfolio Guide", active: false },
    { icon: HelpCircle, label: "DeFi Glossary", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-lg text-royal-purple">HAWI-AI</h1>
              <p className="text-xs text-muted-foreground">DeFi Companion</p>
            </div>
          )}
        </div>
        
        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isOpen && "px-2",
                item.active && "bg-gradient-primary text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </nav>
        
        {/* Quick Actions */}
        {isOpen && (
          <div className="mt-8 p-4 bg-gradient-secondary rounded-lg">
            <h3 className="font-medium text-white mb-2">Quick Start</h3>
            <p className="text-xs text-white/80 mb-3">
              Ask me anything about DeFi, from basics to advanced strategies.
            </p>
            <Button size="sm" variant="outline" className="w-full text-xs border-white/30 text-white hover:bg-white/10">
              Example Questions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
