import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, ExternalLink, User } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentActivities() {
  const { sales, clients, isLoadingSales } = useSalon();

  // Função para formatar data de forma segura
  const formatSafeDate = (dateString: string) => {
    try {
      if (!dateString) {
        return "Data a ser definida";
      }
      
      // Se a data está no formato dd/mm/yyyy, retorna como está
      if (dateString.includes('/')) {
        return dateString;
      }
      
      // Processar datas ISO (formato: 2024-01-15T10:30:00.000Z ou 2024-01-15)
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "Data a ser definida";
      }
      
      // Se a data ISO inclui hora (tem 'T'), mostrar apenas a data
      if (dateString.includes('T')) {
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } else {
        // Se é apenas data (yyyy-mm-dd), mostrar apenas a data
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (error) {
      return "Data a ser definida";
    }
  };

  // Função para obter nome do cliente
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  // Pegar as 5 vendas mais recentes
  const recentSales = sales
    .sort((a, b) => {
      // Ordenar por data (mais recente primeiro)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  if (isLoadingSales) {
    return (
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Histórico de Atividades
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
            <History className="w-5 h-5 mr-2 text-primary" />
            Histórico de Atividades
          </div>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="/caixa">
              Ver Histórico Completo
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentSales.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary/30 rounded-full flex items-center justify-center">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{sale.item}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatSafeDate(sale.date)}</span>
                      <span>•</span>
                      <span>{getClientName(sale.client_id)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant={sale.type === 'package' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {sale.type === 'package' ? 'Pacote' : 'Individual'}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    R$ {parseFloat(sale.price).toFixed(2)}
                  </div>
                  {sale.sessions && sale.sessions > 1 && (
                    <div className="text-xs text-muted-foreground">
                      {sale.sessions_used || 0}/{sale.sessions} sessões
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}