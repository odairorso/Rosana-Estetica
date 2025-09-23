import { useState } from "react";
import { useSalon } from "@/contexts/SalonContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Plus, Phone, Mail, MapPin, History, Calendar, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Função para formatar data
const formatDateBR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const Clientes = () => {
  const { toast } = useToast();
  const { clients, addClient, isLoadingClients, appointments, sales } = useSalon();
  
  // Debug: log dos clientes
  console.log('Clientes carregados:', clients);
  console.log('Loading clientes:', isLoadingClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleNewClient = async () => {
    if (!newClient.name || !newClient.phone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await addClient(newClient);
      setNewClient({ name: '', phone: '', email: '' });
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = (client: any) => {
    setSelectedClient(client);
    setIsHistoryOpen(true);
  };

  // Função para buscar histórico do cliente
  const getClientHistory = (clientId: number) => {
    const clientAppointments = appointments.filter(app => app.clientId === clientId);
    const clientSales = sales.filter(sale => sale.client_id === clientId);
    
    // Combinar e ordenar por data
    const history = [
      ...clientAppointments.map(app => ({
        ...app,
        type: 'appointment',
        date: app.date,
        description: `Agendamento: ${app.service}`,
        status: app.status
      })),
      ...clientSales.map(sale => ({
        ...sale,
        type: 'sale',
        date: sale.date,
        description: `Venda: ${sale.item}`,
        status: sale.status
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return history;
  };

  // Função para calcular sessões usadas de pacotes
  const getPackageProgress = (clientId: number) => {
    const clientPackages = sales.filter(sale => 
      sale.client_id === clientId && 
      sale.type === 'pacote' && 
      sale.sessions && 
      sale.used_sessions !== undefined
    );
    
    return clientPackages.map(pkg => ({
      name: pkg.item,
      used: pkg.used_sessions || 0,
      total: pkg.sessions || 0,
      status: pkg.status
    }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Clientes</h2>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Clientes</h1>
                <p className="text-muted-foreground">Visualize e gerencie todos os seus clientes</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleNewClient} className="bg-gradient-primary">
                      Cadastrar Cliente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Buscar clientes..." 
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary font-medium"
                    />
                  </div>
                  <Button variant="outline" className="bg-gradient-card">
                    Filtros
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {isLoadingClients ? (
                <Card className="bg-gradient-card border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      Carregando clientes...
                    </div>
                  </CardContent>
                </Card>
              ) : clients.length === 0 ? (
                <Card className="bg-gradient-card border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      Nenhum cliente encontrado. Cadastre o primeiro cliente!
                    </div>
                  </CardContent>
                </Card>
              ) : (
                clients.map((client) => (
                  <Card key={client.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {client.phone}
                              </div>
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Última visita</div>
                          <div className="font-semibold text-foreground">{client.lastVisit}</div>
                          <div className="text-sm text-success font-medium mt-1">{client.totalSpent}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getPackageProgress(client.id).length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-end">
                                {getPackageProgress(client.id).map((pkg, index) => (
                                  <Badge 
                                    key={index} 
                                    variant={pkg.used >= pkg.total ? "destructive" : "default"}
                                    className="text-xs"
                                  >
                                    {pkg.name}: {pkg.used}/{pkg.total}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span>Nenhum pacote ativo</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card"
                            onClick={() => handleViewHistory(client)}
                          >
                            <History className="w-4 h-4 mr-1" />
                            Histórico
                          </Button>
                          <Button variant="outline" size="sm" className="bg-gradient-card">
                            <Calendar className="w-4 h-4 mr-1" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Histórico do Cliente */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedClient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{selectedClient.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Gasto</p>
                      <p className="font-medium text-green-600">{selectedClient.totalSpent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pacotes Ativos */}
              {getPackageProgress(selectedClient.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Pacotes Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getPackageProgress(selectedClient.id).map((pkg, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Sessões utilizadas: {pkg.used}/{pkg.total}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={pkg.used >= pkg.total ? "destructive" : "default"}>
                              {pkg.used}/{pkg.total}
                            </Badge>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(pkg.used / pkg.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getClientHistory(selectedClient.id).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getClientHistory(selectedClient.id).map((item: any, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDateBR(item.date)}</TableCell>
                            <TableCell>
                              <Badge variant={item.type === 'appointment' ? 'default' : 'secondary'}>
                                {item.type === 'appointment' ? 'Agendamento' : 'Venda'}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  item.status === 'pago' ? 'default' :
                                  item.status === 'pendente' ? 'secondary' :
                                  item.status === 'confirmado' ? 'default' :
                                  item.status === 'aguardando' ? 'secondary' :
                                  item.status === 'cancelada' ? 'destructive' :
                                  'default'
                                }
                              >
                                {item.status === 'pago' ? 'Pago' :
                                 item.status === 'pendente' ? 'Pendente' :
                                 item.status === 'confirmado' ? 'Confirmado' :
                                 item.status === 'aguardando' ? 'Aguardando' :
                                 item.status === 'cancelada' ? 'Cancelada' :
                                 item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.price ? `R$ ${item.price}` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum histórico encontrado para este cliente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Clientes;