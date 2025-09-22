import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Scissors, Package2, DollarSign, Plus } from "lucide-react";

const actions = [
  {
    title: "Clientes",
    icon: Users,
    gradient: "bg-gradient-primary",
    action: "Adicionar Cliente",
    href: "/clientes/novo",
  },
  {
    title: "Serviços",
    icon: Scissors,
    gradient: "bg-gradient-success",
    action: "Novo Serviço",
    href: "/procedimentos/novo",
  },
  {
    title: "Estoque",
    icon: Package2,
    gradient: "bg-gradient-secondary",
    action: "Gerenciar Estoque",
    href: "/estoque",
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    gradient: "bg-gradient-primary",
    action: "Ver Relatórios",
    href: "/financeiro",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Plus className="w-5 h-5 mr-2 text-primary" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-20 flex-col space-y-2 hover:bg-secondary/50 border border-border/20 rounded-lg transition-all duration-200 hover:shadow-md"
              asChild
            >
              <a href={action.href}>
                <div className={`w-8 h-8 rounded-lg ${action.gradient} flex items-center justify-center shadow-sm`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">{action.title}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}