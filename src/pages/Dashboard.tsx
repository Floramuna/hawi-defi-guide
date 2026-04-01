import { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LearningPaths from "@/pages/LearningPaths";
import PortfolioGuide from "@/pages/PortfolioGuide";
import DeFiGlossary from "@/pages/DeFiGlossary";
import SettingsPage from "@/pages/SettingsPage";

const Dashboard = () => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("chat");
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      const authenticated = await client.isAuthenticated();
      if (!authenticated) {
        navigate("/login");
      } else {
        setIsAuthenticated(true);
      }
    };
    initAuth();
  }, [navigate]);

  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
      navigate("/");
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "chat":
        return <ChatInterface />;
      case "learning":
        return <LearningPaths />;
      case "portfolio":
        return <PortfolioGuide />;
      case "glossary":
        return <DeFiGlossary />;
      case "settings":
        return <SettingsPage />;
      default:
        return <ChatInterface />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <div className="flex-1 flex flex-col">
        <TopBar onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
