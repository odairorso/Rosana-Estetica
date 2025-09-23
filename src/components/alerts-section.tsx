import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Target } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";

export function AlertsSection() {
  const { pendingProcedures } = useSalon();

  const alerts = [];

  // Alerta dinâmico para agendamentos pendentes
  if (pendingProcedures.length > 0) {
    alerts.push({
      title: "Agendamentos Pendentes",
      message: `${pendingProcedures.length} ${pendingProcedures.length === 1 ? 'procedimento aguarda' : 'procedimentos aguardam'} agendamento`,
      type: "warning",
      icon: Calendar,
    });
  }

  // Alertas genéricos (podem ser dinamizados no futuro)
  alerts.push({
    title: "Agenda",
    message: "Verifique sua disponibilidade para hoje",
    type: "info",
    icon: Calendar,
  });

  alerts.push({
    title: "Performance",
    message: "Acompanhe suas metas mensais",
    type: "success",
    icon: Target,
  });

  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-warning" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 3).map((alert, index) => ( // Garante que no máximo 3 alertas sejam mostrados
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/20 border border-border/30">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              alert.type === 'warning' ? 'bg-warning text-warning-foreground' :
              alert.type === 'success' ? 'bg-success text-success-foreground' :
              'bg-primary text-primary-foreground'
            }`}>
              <alert.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{alert.title}</p>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
            </div>
            <Badge 
              variant={alert.type === 'warning' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {alert.type === 'warning' ? 'Atenção' : alert.type === 'success' ? 'Sucesso' : 'Info'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}