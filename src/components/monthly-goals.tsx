import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, Package } from "lucide-react";

const goals = [
  {
    title: "Faturamento",
    current: "R$ 2.635,90",
    target: "R$ 25.000,00",
    percentage: 11,
    icon: DollarSign,
    color: "text-success",
    progressColor: "bg-success",
  },
  {
    title: "Novos Clientes",
    current: "2",
    target: "40",
    percentage: 5,
    icon: Users,
    color: "text-primary",
    progressColor: "bg-primary",
  },
  {
    title: "Pacotes Vendidos",
    current: "3",
    target: "15",
    percentage: 20,
    icon: Package,
    color: "text-warning",
    progressColor: "bg-warning",
  },
];

export function MonthlyGoals() {
  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Package className="w-5 h-5 mr-2 text-primary" />
          Metas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <goal.icon className={`w-4 h-4 ${goal.color}`} />
                <span className="font-medium text-foreground">{goal.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {goal.current} / {goal.target}
              </span>
            </div>
            <div className="space-y-1">
              <Progress value={goal.percentage} className="h-2" />
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${goal.color}`}>
                  {goal.percentage}% da meta mensal
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}