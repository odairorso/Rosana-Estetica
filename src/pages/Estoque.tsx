import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus, AlertTriangle } from "lucide-react";

const mockInventory = [
  {
    id: 1,
    name: "Creme Hidratante Facial",
    category: "Cosméticos",
    quantity: 15,
    minStock: 5,
    price: "R$ 45,00",
    supplier: "Fornecedor A",
  },
  {
    id: 2,
    name: "Óleo Essencial Lavanda",
    category: "Aromaterapia",
    quantity: 3,
    minStock: 10,
    price: "R$ 25,00",
    supplier: "Fornecedor B",
  },
  {
    id: 3,
    name: "Máscaras Descartáveis",
    category: "Materiais",
    quantity: 50,
    minStock: 20,
    price: "R$ 2,00",
    supplier: "Fornecedor C",
  },
  {
    id: 4,
    name: "Serum Vitamina C",
    category: "Cosméticos",
    quantity: 8,
    minStock: 5,
    price: "R$ 80,00",
    supplier: "Fornecedor A",
  },
];

const Estoque = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Estoque</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Controle de Estoque</h1>
                <p className="text-muted-foreground">Gerencie produtos e materiais</p>
              </div>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            <div className="grid gap-4">
              {mockInventory.map((item) => (
                <Card key={item.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Package2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                          <p className="text-muted-foreground font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">{item.supplier}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground mb-1">
                          {item.quantity} unidades
                        </div>
                        {item.quantity <= item.minStock && (
                          <div className="flex items-center text-warning">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Estoque baixo</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-success mb-2">{item.price}</div>
                        <Badge 
                          variant={item.quantity > item.minStock ? 'default' : 'destructive'}
                          className={item.quantity > item.minStock ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                        >
                          {item.quantity > item.minStock ? 'Em estoque' : 'Estoque baixo'}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                          Repor
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

export default Estoque;