import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { ShoppingCartModal } from "@/components/shopping-cart-modal";

const Caixa = () => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Caixa</h2>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Caixa</h1>
                <p className="text-muted-foreground">Página limpa para testes</p>
              </div>
              <Button 
                onClick={() => setIsCartModalOpen(true)}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            </div>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Página Pronta para Teste</h3>
                <p className="text-muted-foreground">Esta página foi limpa e está pronta para implementações de teste.</p>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <ShoppingCartModal 
          isOpen={isCartModalOpen} 
          onClose={() => setIsCartModalOpen(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Caixa;