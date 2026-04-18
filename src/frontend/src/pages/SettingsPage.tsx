import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your HAWI-AI preferences</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are authenticated via Internet Identity. Your identity is anonymous and secure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="chat-notifs">Chat notifications</Label>
            <Switch id="chat-notifs" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="learning-reminders">Learning reminders</Label>
            <Switch id="learning-reminders" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch id="dark-mode" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            HAWI-AI runs on the Internet Computer blockchain. Your conversations are processed on-chain with full privacy. No personal data is collected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
