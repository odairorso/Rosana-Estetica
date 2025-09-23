import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Calendar, Edit, Trash2 } from "lucide-react";
import { useSalon } from "@/contexts/SalonContext";
import { AddPackageModal } from "@/components/add-package-modal";
import { EditPackageModal } from "@/components/edit-package-modal";
const Pacotes = () => {
  const { activPackages, deleteSale, updatePackageSession } = useSalon();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleEditPackage = (packageItem: any) => {
    setSelectedPackage(packageItem);
    setIsEditModalOpen(true);
  };

  const handleDeletePackage = (packageItem: any) => {
    if (window.confirm(`Tem certeza que deseja excluir o pacote "${packageItem.service}"?`)) {
      deleteSale(packageItem.id);
    }
  };

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
              <Button 
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pacote
          </Button>
            </div>

            <div className="grid gap-4">
              {activPackages.map((packageItem) => (
                <Card key={packageItem.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground mb-2">{packageItem.service}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-muted-foreground">Sessões:</span>
                              <span className="font-bold text-primary">{packageItem.sessions || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3 flex-shrink-0 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">{packageItem.price}</div>
                          <Badge 
                            variant="default"
                            className="bg-success text-success-foreground mt-1"
                          >
                            Disponível
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="bg-gradient-card font-medium">
                            Ver Detalhes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card font-medium hover:bg-green-50 text-green-600"
                            onClick={() => updatePackageSession(packageItem.saleId)}
                          >
                            Usar Sessão
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card font-medium hover:bg-blue-50"
                            onClick={() => handleEditPackage(packageItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card font-medium hover:bg-red-50 text-red-600"
                            onClick={() => handleDeletePackage(packageItem)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <EditPackageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        packageData={selectedPackage}
      />
    </SidebarProvider>
  );
};

export default Pacotes;