import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ExternalLink } from "lucide-react";

const financialData = [
  {
    title: "Receita do Mês",
    value: "R$ 18.750",
    trend: "up",
    change: "+12%",
    color: "text-success",
  },
  {
    title: "A Receber",
    value: "R$ 3.200",
    trend: "neutral",
    change: "",
    color: "text-warning",
  },
  {
    title: "Despesas",
    value: "R$ 4.500",
    trend: "down",
    change: "-5%",
    color: "text-destructive",
  },
  {
    title: "Lucro Líquido",
    value: "R$ 14.250",
    trend: "up",
    change: "+18%",
    color: "text-success",
  },
];

export function FinancialSummary() {
  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-success" />
            Resumo Financeiro
          </div>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="/financeiro/relatorio">
              Ver Relatório Completo
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {financialData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
              </div>
              <div className="flex items-baseline space-x-2">
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </p>
                {item.change && (
                  <span className={`text-xs ${item.color}`}>
                    {item.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
