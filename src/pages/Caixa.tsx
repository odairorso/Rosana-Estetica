import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Calendar, User, DollarSign, Package, ChevronDown, ChevronUp } from "lucide-react";
import { ShoppingCartModal } from "@/components/shopping-cart-modal";
import { useSalon } from "@/contexts/SalonContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditSaleModal } from "@/components/edit-sale-modal";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Sale } from "@/contexts/SalonContext";

const Caixa = () => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { sales, clients, isLoadingSales, isLoadingClients, deleteSale, storeSales, isLoadingStoreSales } = useSalon();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

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

  // Função para agrupar vendas por cliente e data
  const groupSalesByClientAndDate = () => {
    // 1. Agrupar vendas de serviços/pacotes
    const serviceSales = sales.reduce((acc, sale) => {
      const key = `${sale.client_id}-${sale.date}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          client_id: sale.client_id,
          date: sale.date,
          items: [],
          total: 0,
          status: sale.status,
          type: 'service'
        };
      }
      acc[key].items.push(sale);
      acc[key].total += parseFloat(sale.price);
      return acc;
    }, {} as Record<string, any>);

    // 2. Agrupar vendas da loja
    const storeSalesGrouped = (storeSales || []).reduce((acc, sale) => {
      // Usar sale_date ou created_at
      const dateStr = sale.sale_date || sale.created_at;
      // Normalizar data para YYYY-MM-DD para agrupamento
      const d = new Date(dateStr);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      const key = `store-${sale.id}`; // Vendas de loja já são agrupadas por venda

      acc[key] = {
        id: key,
        client_id: sale.client_id,
        date: dateStr, // Manter data original completa
        items: [{
          id: sale.id,
          item: `Venda Loja #${sale.sale_number || sale.id.slice(0, 8)}`,
          price: String(sale.total_amount),
          type: 'produto',
          status: sale.payment_status === 'paid' ? 'pago' : 'pendente'
        }],
        total: sale.total_amount,
        status: sale.payment_status === 'paid' ? 'pago' : 'pendente',
        type: 'store'
      };
      return acc;
    }, {} as Record<string, any>);

    // Combinar e ordenar
    const allSales = [...Object.values(serviceSales), ...Object.values(storeSalesGrouped)];

    return allSales.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Função para alternar expansão de uma venda
  const toggleSaleExpansion = (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedSales(newExpanded);
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

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

      // Se a data ISO inclui hora (tem 'T'), mostrar data e hora
      if (dateString.includes('T')) {
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      } else {
        // Se é apenas data (yyyy-mm-dd), mostrar apenas a data
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (error) {
      return "Data a ser definida";
    }
  };



  const totalServiceSales = sales.reduce((sum, sale) => sum + parseFloat(sale.price), 0);
  const totalStoreSales = (storeSales || []).reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
  const totalSales = totalServiceSales + totalStoreSales;

  const todayServiceSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todayStoreSales = (storeSales || []).filter(sale => {
    if (!sale.sale_date && !sale.created_at) return false;
    const dateStr = sale.sale_date || sale.created_at;
    const saleDate = new Date(dateStr);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todaySalesCount = todayServiceSales.length + todayStoreSales.length;
  const allSalesCount = sales.length + (storeSales || []).length;

  const todayTotal = todayServiceSales.reduce((sum, sale) => sum + parseFloat(sale.price), 0) +
    todayStoreSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Caixa</h2>
            </div>
          </header>

          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
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
                    {isLoadingSales || isLoadingStoreSales ? "..." : todaySalesCount}
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
                    {isLoadingSales || isLoadingStoreSales ? "..." : allSalesCount}
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
                    {isLoadingSales || isLoadingStoreSales ? "..." : allSalesCount > 0 ? `R$ ${(totalSales / allSalesCount).toFixed(2)}` : "R$ 0,00"}
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
                    {groupSalesByClientAndDate().map((groupedSale) => (
                      <div key={groupedSale.id} className="bg-muted/50 rounded-lg overflow-hidden">
                        {/* Cabeçalho da venda agrupada - clicável */}
                        <div
                          className="flex items-center justify-between p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                          onClick={() => toggleSaleExpansion(groupedSale.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {groupedSale.client_id ? getClientName(Number(groupedSale.client_id)) : 'Cliente não identificado'}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatSafeDate(groupedSale.date)}
                                </span>
                                <span>•</span>
                                <span>{groupedSale.items.length} {groupedSale.items.length === 1 ? 'item' : 'itens'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={groupedSale.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {groupedSale.status === 'pago' ? 'Pago' : 'Pendente'}
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold text-foreground">
                                R$ {groupedSale.total.toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total da venda
                              </div>
                            </div>
                            {expandedSales.has(groupedSale.id) ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Detalhes dos itens - expansível */}
                        {expandedSales.has(groupedSale.id) && (
                          <div className="border-t border-border/50 bg-muted/30">
                            <div className="p-4 space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-3">Itens da venda:</h4>
                              {groupedSale.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="font-medium text-foreground text-sm">
                                      {item.item}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.type === 'pacote' && item.sessions && `${item.sessions} sessões`}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium text-foreground">
                                      R$ {parseFloat(item.price).toFixed(2)}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                          <span className="sr-only">Abrir menu</span>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
