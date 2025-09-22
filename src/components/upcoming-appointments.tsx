import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ExternalLink } from "lucide-react";

export function UpcomingAppointments() {
  return (
    <Card className="bg-gradient-card border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Próximos Atendimentos
          </div>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="/agendamentos">
              Ver Todos os Agendamentos
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary/30 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Nenhum atendimento agendado</p>
          <Button variant="outline" size="sm" asChild>
            <a href="/agendamentos/novo">
              <Plus className="w-4 h-4 mr-2" />
              Agendar Atendimento
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Import missing Plus icon
import { Plus } from "lucide-react";