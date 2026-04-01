import { Brain, MessageCircle, BookOpen, TrendingUp, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar = ({ isOpen, activePage, onNavigate }: SidebarProps) => {
  const menuItems = [
    { icon: MessageCircle, label: "Chat", key: "chat" },
    { icon: BookOpen, label: "Learning Paths", key: "learning" },
    { icon: TrendingUp, label: "Portfolio Guide", key: "portfolio" },
    { icon: HelpCircle, label: "DeFi Glossary", key: "glossary" },
    { icon: Settings, label: "Settings", key: "settings" },
  ];

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-primary p-2 rounded-lg">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-lg text-primary">HAWI-AI</h1>
              <p className="text-xs text-muted-foreground">DeFi Companion</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={activePage === item.key ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isOpen && "px-2",
                activePage === item.key && "bg-primary text-primary-foreground"
              )}
              onClick={() => onNavigate(item.key)}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </nav>

        {isOpen && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="font-medium text-foreground mb-2">Quick Start</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Ask me anything about DeFi, from basics to advanced strategies.
            </p>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => onNavigate("chat")}>
              Start Chatting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
