import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Calendar } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";

const Pacotes = () => {
  const { activPackages } = useSalon();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Pacotes</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Pacotes</h1>
                <p className="text-muted-foreground">Visualize e controle todos os pacotes de serviços</p>
              </div>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Pacote
              </Button>
            </div>

            <div className="grid gap-4">
              {activPackages.map((packageItem) => (
                <Card key={packageItem.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{packageItem.service}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-muted-foreground">Usados:</span>
                              <span className="font-bold text-primary">{packageItem.usedSessions || 0}/{packageItem.sessions || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-muted-foreground">Restam:</span>
                              <span className="font-bold text-success">{(packageItem.sessions || 0) - (packageItem.usedSessions || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-success mb-2">{packageItem.price}</div>
                        <Badge 
                          variant={packageItem.status === 'concluido' ? 'secondary' : 'default'}
                          className={packageItem.status === 'concluido' ? 'bg-muted text-muted-foreground' : 'bg-success text-success-foreground'}
                        >
                          {packageItem.status === 'concluido' ? 'Finalizado' : packageItem.status === 'agendado' ? 'Agendado' : 'Aguardando'}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                          Ver Detalhes
                        </Button>
                        {packageItem.status !== 'concluido' && (
                          <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                            Usar Sessão
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {activPackages.length === 0 && (
                <Card className="bg-gradient-card border-0 shadow-md">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum pacote encontrado</h3>
                    <p className="text-muted-foreground">Quando você vender pacotes, eles aparecerão aqui.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Pacotes;