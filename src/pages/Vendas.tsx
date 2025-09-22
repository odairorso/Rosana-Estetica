import { useState } from "react";
import { useSalon } from "@/contexts/SalonContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Search, Edit, Trash2, DollarSign } from "lucide-react";
import { EditSaleModal } from "@/components/edit-sale-modal";
import { Sale } from "@/contexts/SalonContext";
import { formatDateBR } from "@/lib/utils";

const Vendas = () => {
  const { sales, isLoadingSales, deleteSale } = useSalon();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredSales = sales.filter(sale =>
    sale.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditModalOpen(true);
  };

  const handleDeleteSale = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteSale(id);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "pago" ? (
      <Badge className="bg-green-100 text-green-800">Pago</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      procedimento: "bg-blue-100 text-blue-800",
      pacote: "bg-purple-100 text-purple-800",
      produto: "bg-orange-100 text-orange-800"
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  const totalVendas = filteredSales.reduce((total, sale) => {
    const price = parseFloat(sale.price.replace("R$", "").replace(",", ".").trim());
    return total + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Vendas</h2>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Vendas</h1>
                <p className="text-muted-foreground">Gerencie todas as vendas realizadas</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-card p-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Total: R$ {totalVendas.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredSales.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Pagas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredSales.filter(sale => sale.status === "pago").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredSales.filter(sale => sale.status === "pendente").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Busca */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por item ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabela de Vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando vendas...</p>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "Nenhuma venda encontrada com os critérios de busca." : "Nenhuma venda realizada ainda."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sessões</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.client || "N/A"}</TableCell>
                          <TableCell>{sale.item}</TableCell>
                          <TableCell>{getTypeBadge(sale.type)}</TableCell>
                          <TableCell>R$ {sale.price}</TableCell>
                          <TableCell>{formatDateBR(sale.date)}</TableCell>
                          <TableCell>{getStatusBadge(sale.status)}</TableCell>
                          <TableCell>
                            {sale.sessions ? `${sale.used_sessions || 0}/${sale.sessions}` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSale(sale)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSale(sale.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <EditSaleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSale(null);
        }}
        sale={editingSale}
      />
    </SidebarProvider>
  );
};

export default Vendas;