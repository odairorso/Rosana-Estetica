import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Plus, Clock } from "lucide-react";

const mockProcedures = [
  {
    id: 1,
    name: "Limpeza de Pele",
    duration: "90 min",
    price: "R$ 120,00",
    category: "Facial",
    description: "Limpeza profunda com extração",
  },
  {
    id: 2,
    name: "Massagem Relaxante",
    duration: "60 min",
    price: "R$ 80,00",
    category: "Corporal",
    description: "Massagem para alívio de tensões",
  },
  {
    id: 3,
    name: "Peeling Químico",
    duration: "45 min",
    price: "R$ 150,00",
    category: "Facial",
    description: "Renovação celular com ácidos",
  },
  {
    id: 4,
    name: "Drenagem Linfática",
    duration: "50 min",
    price: "R$ 100,00",
    category: "Corporal",
    description: "Estimulação do sistema linfático",
  },
];

const Procedimentos = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Procedimentos</h2>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Catálogo de Procedimentos</h1>
                <p className="text-muted-foreground">Gerencie todos os serviços oferecidos</p>
              </div>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Procedimento
              </Button>
            </div>

            <div className="grid gap-4">
              {mockProcedures.map((procedure) => (
                <Card key={procedure.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{procedure.name}</h3>
                          <p className="text-muted-foreground font-medium">{procedure.category}</p>
                          <p className="text-sm text-muted-foreground">{procedure.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">{procedure.duration}</span>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                          {procedure.category}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-success mb-2">{procedure.price}</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Procedimentos;