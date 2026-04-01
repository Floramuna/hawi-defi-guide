import { BookOpen, ChevronRight, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const learningPaths = [
  {
    title: "DeFi Fundamentals",
    description: "Learn the basics of decentralized finance, wallets, and blockchain.",
    modules: 8,
    duration: "4 hours",
    level: "Beginner",
    progress: 0,
  },
  {
    title: "Liquidity Pools & AMMs",
    description: "Understand automated market makers and how liquidity pools work.",
    modules: 6,
    duration: "3 hours",
    level: "Intermediate",
    progress: 0,
  },
  {
    title: "Yield Farming Strategies",
    description: "Master yield farming, staking, and compounding strategies.",
    modules: 10,
    duration: "5 hours",
    level: "Advanced",
    progress: 0,
  },
  {
    title: "Smart Contract Security",
    description: "Learn about common vulnerabilities and how to assess DeFi protocols.",
    modules: 7,
    duration: "4 hours",
    level: "Advanced",
    progress: 0,
  },
];

const LearningPaths = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learning Paths</h1>
        <p className="text-muted-foreground">Structured courses to master DeFi concepts</p>
      </div>

      <div className="grid gap-4">
        {learningPaths.map((path, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{path.description}</p>
                </div>
              </div>
              <Badge variant={path.level === "Beginner" ? "secondary" : path.level === "Intermediate" ? "default" : "destructive"}>
                {path.level}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" /> {path.modules} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {path.duration}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="gap-1">
                  Start <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={path.progress} className="mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LearningPaths;
