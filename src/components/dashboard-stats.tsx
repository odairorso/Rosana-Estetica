import { DollarSign, Users, Package, Star, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Faturamento Hoje",
    value: "R$ 0,00",
    subtitle: "Clique para ver detalhes",
    icon: DollarSign,
    gradient: "bg-gradient-success",
    trend: null,
  },
  {
    title: "Clientes Hoje",
    value: "0",
    subtitle: "0 novos clientes",
    icon: Users,
    gradient: "bg-gradient-primary",
    trend: null,
  },
  {
    title: "Pacotes Vendidos",
    value: "3",
    subtitle: "Este mês",
    icon: Package,
    gradient: "bg-gradient-secondary",
    trend: "+2 esta semana",
  },
  {
    title: "Avaliação Média",
    value: "4.9",
    subtitle: "142 avaliações",
    icon: Star,
    gradient: "bg-gradient-primary",
    trend: "+0.1 este mês",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 rounded-lg ${stat.gradient} flex items-center justify-center shadow-sm`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.subtitle}
            </p>
            {stat.trend && (
              <Badge variant="secondary" className="text-xs bg-success-muted text-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}