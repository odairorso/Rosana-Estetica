import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ExternalLink, Plus } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";

export function UpcomingAppointments() {
  const { appointments, isLoadingAppointments } = useSalon();

  // Filtrar agendamentos de hoje e próximos dias
  const today = new Date();
  const upcomingAppointments = appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Mostrar apenas os próximos 3

  if (isLoadingAppointments) {
    return (
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Próximos Atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary/30 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Nenhum atendimento agendado</p>
            <Button variant="outline" size="sm" asChild>
              <a href="/agendamentos">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Atendimento
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{appointment.client}</p>
                    <p className="text-xs text-muted-foreground">{appointment.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {appointment.time}
                  </div>
                  <Badge variant={appointment.status === 'confirmado' ? 'default' : 'secondary'} className="text-xs">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}