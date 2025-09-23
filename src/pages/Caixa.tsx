import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Calendar, User, DollarSign, Package } from "lucide-react";
import { ShoppingCartModal } from "@/components/shopping-cart-modal";
import { useSalon } from "@/contexts/SalonContext";
import { format } from "date-fns";
import { EditSaleModal } from "@/components/edit-sale-modal";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Sale } from "@/contexts/SalonContext";

const Caixa = () => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { sales, clients, isLoadingSales, isLoadingClients, deleteSale } = useSalon();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setSaleToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete !== null) {
      deleteSale(saleToDelete);
      toast({ title: "Sucesso", description: "Venda excluída com sucesso." });
      setIsAlertOpen(false);
      setSaleToDelete(null);
    }
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  const formatSafeDate = (dateString: string) => {
    try {
      if (!dateString || new Date(dateString).toString() === 'Invalid Date') {
        return "Data a ser definida";
      }
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };



  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.price), 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, sale) => sum + parseFloat(sale.price), 0);

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
                <p className="text-muted-foreground">
                  {isLoadingSales ? "Carregando..." : `${sales.length} vendas registradas`}
                </p>
              </div>
              <Button 
                onClick={() => setIsCartModalOpen(true)}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            </div>

            {/* Resumo do dia */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vendas Hoje
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingSales ? "..." : todaySales.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    R$ {isLoadingSales ? "..." : todayTotal.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Vendas
                  </CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingSales ? "..." : sales.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    R$ {isLoadingSales ? "..." : totalSales.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoadingSales ? "..." : sales.length > 0 ? `R$ ${(totalSales / sales.length).toFixed(2)}` : "R$ 0,00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por venda
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de vendas */}
            {isLoadingSales || isLoadingClients ? (
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Carregando vendas...</h3>
                  <p className="text-muted-foreground">Aguarde enquanto buscamos os dados.</p>
                </CardContent>
              </Card>
            ) : sales.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma venda registrada</h3>
                  <p className="text-muted-foreground">Comece registrando uma nova venda.</p>
                  <Button 
                    onClick={() => setIsCartModalOpen(true)}
                    className="mt-4 bg-gradient-primary text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Venda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Histórico de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {getClientName(sale.client_id)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatSafeDate(sale.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={sale.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {sale.status === 'pago' ? 'Pago' : 'Pendente'}
                          </Badge>
                          <div className="text-right">
                            <div className="font-bold text-foreground">
                              R$ {parseFloat(sale.price).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sale.item}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(sale)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(sale.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
        <ShoppingCartModal 
          isOpen={isCartModalOpen} 
          onClose={() => setIsCartModalOpen(false)} 
        />

        <EditSaleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSale(null);
          }}
          sale={selectedSale}
        />

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente a venda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default Caixa;