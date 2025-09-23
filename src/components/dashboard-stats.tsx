import { DollarSign, Users, Package, Star, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSalon } from "@/contexts/SalonContext";

export function DashboardStats() {
  const { sales, appointments, clients, isLoadingSales, isLoadingAppointments, isLoadingClients } = useSalon();

  // Função para obter a data de hoje no formato YYYY-MM-DD, considerando o fuso horário local
  const getTodayLocalString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayLocalString();
  
  // Faturamento hoje
  const todayRevenue = sales
    .filter(sale => sale.date === todayString && sale.status === 'pago')
    .reduce((total, sale) => total + parseFloat(sale.price.replace('R$ ', '').replace(',', '.')), 0);

  // Agendamentos hoje
  const todayAppointments = appointments.filter(appointment => appointment.date === todayString);

  // Pacotes vendidos este mês
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const packagesThisMonth = sales.filter(sale => {
    // Adicionando verificação para garantir que sale.date é uma string válida
    if (typeof sale.date !== 'string' || !sale.date.includes('-')) {
      return false;
    }
    const saleDate = new Date(sale.date);
    return sale.type === 'pacote' && 
           saleDate.getMonth() === currentMonth && 
           saleDate.getFullYear() === currentYear;
  }).length;

  // Total de clientes
  const totalClients = clients.length;

  const stats = [
    {
      title: "Faturamento Hoje",
      value: `R$ ${todayRevenue.toFixed(2).replace('.', ',')}`,
      subtitle: `${todayAppointments.length} atendimentos hoje`,
      icon: DollarSign,
      gradient: "bg-gradient-success",
      trend: null,
      loading: isLoadingSales,
    },
    {
      title: "Clientes Cadastrados",
      value: totalClients.toString(),
      subtitle: "Total de clientes",
      icon: Users,
      gradient: "bg-gradient-primary",
      trend: null,
      loading: isLoadingClients,
    },
    {
      title: "Pacotes Vendidos",
      value: packagesThisMonth.toString(),
      subtitle: "Este mês",
      icon: Package,
      gradient: "bg-gradient-secondary",
      trend: null,
      loading: isLoadingSales,
    },
    {
      title: "Agendamentos Hoje",
      value: todayAppointments.length.toString(),
      subtitle: "Atendimentos marcados",
      icon: Star,
      gradient: "bg-gradient-primary",
      trend: null,
      loading: isLoadingAppointments,
    },
  ];

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
              {stat.loading ? "..." : stat.value}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.loading ? "Carregando..." : stat.subtitle}
            </p>
            {stat.trend && !stat.loading && (
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