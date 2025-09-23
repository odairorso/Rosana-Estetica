import { useState } from "react";
import { useSalon } from "@/contexts/SalonContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Plus, Phone, Mail, MapPin, History, Calendar, Package, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Função para formatar data
const formatDateBR = (dateString: string) => {
  // Se já está no formato brasileiro (dd/mm/yyyy), retorna como está
  if (dateString.includes('/') && dateString.split('/').length === 3) {
    return dateString;
  }
  // Caso contrário, converte de ISO para formato brasileiro
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const Clientes = () => {
  const { toast } = useToast();
  const { clients, addClient, updateClient, deleteClient, isLoadingClients, appointments, sales } = useSalon();
  
  // Debug: log dos clientes
  console.log('Clientes carregados:', clients);
  console.log('Loading clientes:', isLoadingClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
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
      setNewClient({ 
        name: '', 
        phone: '', 
        email: '',
        cpf: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      });
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

  const handleEditClient = (client: any) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      cpf: client.cpf || '',
      rua: client.rua || '',
      numero: client.numero || '',
      bairro: client.bairro || '',
      cidade: client.cidade || '',
      estado: client.estado || '',
      cep: client.cep || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !editingClient.name || !editingClient.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { id, ...updates } = editingClient;
      await updateClient(id, updates);
      setIsEditDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = (client: any) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      await deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        variant: "destructive",
      });
    }
  };

  // Função para buscar histórico do cliente
  const getClientHistory = (clientId: number) => {
    const clientAppointments = appointments.filter(app => app.client_id === clientId);
    const clientSales = sales.filter(sale => sale.client_id === clientId);
    
    // Combinar e ordenar por data
    const history = [
      ...clientAppointments.map(app => {
        // Verificar se é um pacote
        const isPackage = app.type === 'pacote' || app.service?.toLowerCase().includes('pacote');
        
        // Para pacotes, encontrar a venda correspondente para obter informações do pacote
        let packageInfo = null;
        let valuePerSession = app.price;
        
        if (isPackage) {
          const relatedSale = clientSales.find(sale => 
            sale.type === 'pacote' && 
            (sale.item === app.service || app.service?.includes(sale.item))
          );
          
          if (relatedSale && relatedSale.sessions) {
            const totalValue = parseFloat(relatedSale.price) || 0;
            valuePerSession = (totalValue / relatedSale.sessions).toFixed(2);
            
            // Contar sessões do mesmo pacote até esta data
            const samePackageAppointments = clientAppointments.filter(
              a => a.service === app.service && 
                   (a.status === 'concluido' || a.status === 'completed') && 
                   new Date(a.date) <= new Date(app.date)
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const currentSessionNumber = samePackageAppointments.findIndex(a => a.id === app.id) + 1;
            packageInfo = currentSessionNumber > 0 ? `${currentSessionNumber}ª sessão de ${relatedSale.sessions}` : null;
          }
        } else {
          // Para procedimentos individuais, contar sessões normalmente
          const sameServiceAppointments = clientAppointments.filter(
            a => a.service === app.service && 
                 (a.status === 'concluido' || a.status === 'completed') && 
                 new Date(a.date) <= new Date(app.date)
          ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          const currentSessionNumber = sameServiceAppointments.findIndex(a => a.id === app.id) + 1;
          packageInfo = (app.status === 'concluido' || app.status === 'completed') && currentSessionNumber > 0 ? `${currentSessionNumber}ª sessão` : null;
        }
        
        return {
          ...app,
          type: 'appointment',
          date: app.date,
          description: app.service || 'Agendamento',
          status: app.status,
          sessionInfo: packageInfo,
          time: app.time || '00:00',
          value: valuePerSession,
          isPackage: isPackage
        };
      }),
      ...clientSales
        .filter(sale => sale.type !== 'package') // Filtrar apenas produtos do estoque
        .map(sale => ({
          ...sale,
          type: 'sale',
          date: sale.date,
          description: sale.item || 'Venda',
          status: sale.status,
          sessionInfo: null,
          time: '00:00'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return history;
  };



  // Função para calcular progresso de todos os pacotes (incluindo finalizados)
  const getAllPackageProgress = (clientId: number) => {
    const clientSales = sales.filter(sale => sale.client_id === clientId && sale.type === 'package');
    const clientAppointments = appointments.filter(appointment => appointment.client_id === clientId);
    
    return clientSales.map(sale => {
      const completedSessions = clientAppointments.filter(
        appointment => appointment.sale_id === sale.id && appointment.status === 'completed'
      ).length;
      
      return {
        name: sale.procedure_name,
        completed: completedSessions,
        total: sale.sessions || 1,
        totalValue: parseFloat(sale.price) || 0
      };
    });
  };

  // Função para calcular resumo das sessões por tipo de procedimento
  const getSessionsSummary = (clientId: number) => {
    const clientAppointments = appointments.filter(
      appointment => appointment.client_id === clientId && appointment.status === 'completed'
    );
    
    const summary = clientAppointments.reduce((acc, appointment) => {
      const serviceName = appointment.service || 'Serviço não especificado';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(summary).map(([service, count]) => ({
      service,
      count
    }));
  };

  // Função para calcular progresso dos pacotes (apenas ativos)
  const getPackageProgress = (clientId: number) => {
    const clientSales = sales.filter(sale => sale.client_id === clientId && sale.type === 'package');
    const clientAppointments = appointments.filter(appointment => appointment.client_id === clientId);
    
    return clientSales.map(sale => {
      const completedSessions = clientAppointments.filter(
        appointment => appointment.sale_id === sale.id && appointment.status === 'completed'
      ).length;
      
      return {
        name: sale.procedure_name,
        completed: completedSessions,
        total: sale.sessions || 1
      };
    }).filter(pkg => pkg.completed < pkg.total); // Filtrar apenas pacotes não finalizados
  };

  const getGroupedHistory = (clientId: number) => {
    const history = getClientHistory(clientId);
    const grouped = history.reduce((acc, item) => {
      const dateKey = item.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
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
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                    <div className="grid gap-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={newClient.cpf}
                        onChange={(e) => setNewClient({ ...newClient, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={newClient.cep}
                        onChange={(e) => setNewClient({ ...newClient, cep: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rua">Rua/Avenida</Label>
                      <Input
                        id="rua"
                        value={newClient.rua}
                        onChange={(e) => setNewClient({ ...newClient, rua: e.target.value })}
                        placeholder="Nome da rua ou avenida"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={newClient.numero}
                          onChange={(e) => setNewClient({ ...newClient, numero: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={newClient.bairro}
                          onChange={(e) => setNewClient({ ...newClient, bairro: e.target.value })}
                          placeholder="Nome do bairro"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={newClient.cidade}
                          onChange={(e) => setNewClient({ ...newClient, cidade: e.target.value })}
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={newClient.estado}
                          onChange={(e) => setNewClient({ ...newClient, estado: e.target.value })}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
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
                                    variant="default"
                                    className="text-xs"
                                  >
                                    {pkg.name}: {pkg.completed}/{pkg.total}
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
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClient(client)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
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

              {/* Resumo de Sessões */}
              {getSessionsSummary(selectedClient.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Resumo de Sessões Realizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {getSessionsSummary(selectedClient.id).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div>
                            <p className="font-medium text-sm">{item.service}</p>
                            <p className="text-xs text-muted-foreground">Procedimento</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.count === 1 ? 'sessão' : 'sessões'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pacotes */}
              {getAllPackageProgress(selectedClient.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Pacotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getAllPackageProgress(selectedClient.id).map((pkg, index) => {
                        const valuePerSession = pkg.totalValue ? (pkg.totalValue / pkg.total).toFixed(2) : '0.00';
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-700 bg-gray-800/30 rounded-lg">
                            <div>
                              <p className="font-medium text-white">{pkg.name}</p>
                              <p className="text-sm text-gray-400">
                                Sessões utilizadas: {pkg.completed}/{pkg.total}
                              </p>
                              <p className="text-sm text-green-400 font-medium">
                                R$ {valuePerSession} por sessão
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={pkg.completed >= pkg.total ? "destructive" : "default"}>
                                {pkg.completed}/{pkg.total}
                              </Badge>
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(pkg.completed / pkg.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {getGroupedHistory(selectedClient.id).map(([date, items]) => (
                        <div key={date} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-lg mb-3 text-primary">
                            {formatDateBR(date)}
                          </h4>
                          <div className="space-y-2">
                            {items.map((item: any, index) => (
                               <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-md">
                                 <div className="flex items-center gap-3">
                                   <div className="text-sm text-gray-400 min-w-[50px]">
                                     {item.time !== '00:00' ? item.time : '-'}
                                   </div>
                                   <Badge variant={item.type === 'appointment' ? 'default' : 'secondary'} className="min-w-[80px] justify-center">
                                     {item.type === 'appointment' ? 'Agendamento' : 'Venda'}
                                   </Badge>
                                   <div className="flex-1">
                                     <div className="font-medium text-white">{item.description}</div>
                                     {item.sessionInfo && (
                                       <div className="text-sm text-blue-400 font-medium bg-blue-900/30 border border-blue-700 px-2 py-1 rounded-md inline-block mt-1">
                                         {item.sessionInfo}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    className={
                                      item.status === 'completed' || item.status === 'pago' ? 'bg-green-900/30 text-green-400 border-green-700' :
                                      item.status === 'confirmado' ? 'bg-blue-900/30 text-blue-400 border-blue-700' :
                                      item.status === 'pendente' || item.status === 'aguardando' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' :
                                      item.status === 'cancelada' ? 'bg-red-900/30 text-red-400 border-red-700' :
                                      'bg-gray-900/30 text-gray-400 border-gray-700'
                                    }
                                    variant="outline"
                                  >
                                    {item.status === 'completed' ? 'Concluído' :
                                     item.status === 'pago' ? 'Pago' :
                                     item.status === 'pendente' ? 'Pendente' :
                                     item.status === 'confirmado' ? 'Confirmado' :
                                     item.status === 'aguardando' ? 'Aguardando' :
                                     item.status === 'cancelada' ? 'Cancelada' :
                                     item.status}
                                  </Badge>
                                  <div className="font-semibold text-green-400 min-w-[80px] text-right">
                                    {item.value ? `R$ ${item.value}` : (item.price ? `R$ ${item.price}` : '-')}
                                    {item.isPackage && (
                                      <span className="text-xs text-gray-400 block">
                                        por sessão
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Modal de Edição de Cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          
          {editingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome *</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input
                    id="edit-cpf"
                    value={editingClient.cpf}
                    onChange={(e) => setEditingClient({...editingClient, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-cep">CEP</Label>
                  <Input
                    id="edit-cep"
                    value={editingClient.cep}
                    onChange={(e) => setEditingClient({...editingClient, cep: e.target.value})}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rua">Rua/Avenida</Label>
                  <Input
                    id="edit-rua"
                    value={editingClient.rua}
                    onChange={(e) => setEditingClient({...editingClient, rua: e.target.value})}
                    placeholder="Nome da rua"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-numero">Número</Label>
                  <Input
                    id="edit-numero"
                    value={editingClient.numero}
                    onChange={(e) => setEditingClient({...editingClient, numero: e.target.value})}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bairro">Bairro</Label>
                  <Input
                    id="edit-bairro"
                    value={editingClient.bairro}
                    onChange={(e) => setEditingClient({...editingClient, bairro: e.target.value})}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cidade">Cidade</Label>
                  <Input
                    id="edit-cidade"
                    value={editingClient.cidade}
                    onChange={(e) => setEditingClient({...editingClient, cidade: e.target.value})}
                    placeholder="Nome da cidade"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Input
                  id="edit-estado"
                  value={editingClient.estado}
                  onChange={(e) => setEditingClient({...editingClient, estado: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateClient} className="bg-gradient-primary">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja excluir o cliente <strong>{selectedClient.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os dados relacionados a este cliente serão removidos.
              </p>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDeleteClient}>
                  Excluir Cliente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Clientes;