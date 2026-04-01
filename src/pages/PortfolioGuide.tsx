import { TrendingUp, PieChart, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tips = [
  {
    icon: PieChart,
    title: "Diversification",
    description: "Spread investments across multiple protocols and asset types to reduce risk. Never put all funds in one protocol.",
  },
  {
    icon: TrendingUp,
    title: "Dollar-Cost Averaging",
    description: "Invest fixed amounts at regular intervals to reduce the impact of volatility on your portfolio.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Management",
    description: "Only invest what you can afford to lose. Set stop-losses and take-profit levels for active positions.",
  },
  {
    icon: Lightbulb,
    title: "Research First",
    description: "Always DYOR (Do Your Own Research). Check audits, team backgrounds, and TVL before investing in any protocol.",
  },
];

const PortfolioGuide = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Portfolio Guide</h1>
        <p className="text-muted-foreground">Strategies and tips for managing your DeFi portfolio</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground">
            Use the HAWI-AI chat to ask specific questions about portfolio strategies, risk assessment, or any DeFi protocol you're considering.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioGuide;
