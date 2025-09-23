import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus } from "lucide-react";

const Financeiro = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Financeiro</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Financeiro</h1>
                <p className="text-muted-foreground">Página limpa para testes</p>
              </div>
              <Button 
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Lançamento
              </Button>
            </div>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Página Pronta para Teste</h3>
                <p className="text-muted-foreground">Esta página foi criada e está pronta para implementações de teste.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Financeiro;