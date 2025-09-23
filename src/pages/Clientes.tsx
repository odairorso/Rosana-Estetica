import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, History, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";

// Funcao para formatar data
const formatDate = (dateString: string) => {
  // Se ja esta no formato brasileiro (dd/mm/yyyy), retorna como esta
  if (dateString.includes('/')) {
    return dateString;
  }
  // Caso contrario, converte de ISO para formato brasileiro
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  created_at: string;
  lastVisit?: string;
  totalSpent?: string;
}

interface Appointment {
  id: string;
  client_id: string;
  service: string;
  date: string;
  time: string;
  status: string;
  price: number;
  package_id?: string;
}

interface Sale {
  id: string;
  client_id: string;
  service: string;
  price: string;
  sessions?: number;
  date: string;
  type: 'procedure' | 'package';
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    birthDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone sao obrigatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const newClientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        rua: formData.address || null,
        numero: formData.number || null,
        bairro: formData.neighborhood || null,
        cidade: formData.city || null,
        estado: formData.state || null,
        cep: formData.zipCode || null,
        cpf: formData.birthDate || null, // Temporariamente usando birthDate para CPF
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([newClientData])
        .select();

      if (error) {
        console.error('Erro ao salvar cliente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o cliente no servidor.",
          variant: "destructive"
        });
        return;
      }

      console.log('Cliente salvo com sucesso:', data);
      
      // Recarregar a lista de clientes
      const { data: updatedClients, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fetchError && updatedClients) {
        setClients(updatedClients);
      }

      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        birthDate: ''
      });

      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o servidor.",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome e obrigatorio",
        variant: "destructive"
      });
      return;
    }

    if (!selectedClient) return;

    try {
      const updatedClientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        rua: formData.address || null,
        numero: formData.number || null,
        bairro: formData.neighborhood || null,
        cidade: formData.city || null,
        estado: formData.state || null,
        cep: formData.zipCode || null,
        cpf: formData.birthDate || null,
      };

      const { error } = await supabase
        .from('clients')
        .update(updatedClientData)
        .eq('id', selectedClient.id);

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cliente.",
          variant: "destructive"
        });
        return;
      }

      // Recarregar a lista de clientes
      const { data: updatedClients, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fetchError && updatedClients) {
        setClients(updatedClients);
      }

      setIsEditDialogOpen(false);
      setSelectedClient(null);
      
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o servidor.",
        variant: "destructive"
      });
    }

    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso!"
    });
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) {
        console.error('Erro ao deletar cliente:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o cliente.",
          variant: "destructive"
        });
        return;
      }

      // Recarregar a lista de clientes
      const { data: updatedClients, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fetchError && updatedClients) {
        setClients(updatedClients);
      }

      toast({
        title: "Sucesso",
        description: "Cliente excluido com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o servidor.",
        variant: "destructive"
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      number: client.number || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      state: client.state || '',
      zipCode: client.zipCode || '',
      birthDate: client.birthDate || ''
    });
    setIsEditDialogOpen(true);
  };

  // Funcao para buscar historico do cliente
  const handleViewHistory = async (client: Client) => {
    setSelectedClient(client);
    
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]') as Appointment[];
    const sales = JSON.parse(localStorage.getItem('sales') || '[]') as Sale[];
    
    const clientAppointments = appointments.filter(app => app.client_id === client.id);
    
    const history = clientAppointments.map(app => {
      let packageInfo = null;
      
      // Verificar se e um pacote
      if (app.package_id) {
        // Para pacotes, encontrar a venda correspondente para obter informacoes do pacote
        const relatedSale = sales.find(sale => 
          sale.id === app.package_id && 
          sale.client_id === client.id && 
          sale.type === 'package'
        );
        
        if (relatedSale) {
          // Contar quantas sessoes deste pacote ja foram realizadas ate esta data
          const packageAppointments = clientAppointments
            .filter(a => a.package_id === app.package_id)
            .filter(a => new Date(a.date + ' ' + a.time) <= new Date(app.date + ' ' + app.time))
            .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
          
          const currentSessionNumber = packageAppointments.findIndex(a => a.id === app.id) + 1;
          
          packageInfo = currentSessionNumber > 0 ? `${currentSessionNumber}a sessao de ${relatedSale.sessions}` : null;
        }
      } else {
        // Para procedimentos individuais, contar sessoes normalmente
        const procedureAppointments = clientAppointments
          .filter(a => a.service === app.service && !a.package_id)
          .filter(a => new Date(a.date + ' ' + a.time) <= new Date(app.date + ' ' + app.time))
          .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
        
        const currentSessionNumber = procedureAppointments.findIndex(a => a.id === app.id) + 1;
        
        packageInfo = (app.status === 'concluido' || app.status === 'completed') && currentSessionNumber > 0 ? `${currentSessionNumber}a sessao` : null;
      }
      
      return {
        id: app.id,
        service: app.service,
        date: app.date,
        time: app.time,
        status: app.status,
        price: app.price,
        packageInfo,
        type: app.package_id ? 'package' : 'procedure'
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
    
    setClientHistory(history);
    setIsHistoryOpen(true);
  };

  // Funcao para calcular progresso de todos os pacotes (incluindo finalizados)
  const getAllPackageProgress = (clientId: string) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]') as Appointment[];
    const sales = JSON.parse(localStorage.getItem('sales') || '[]') as Sale[];
    
    const clientPackages = sales.filter(sale => 
      sale.client_id === clientId && 
      sale.type === 'package'
    );
    
    return clientPackages.map(pkg => {
      const packageAppointments = appointments.filter(app => app.package_id === pkg.id);
      const completedSessions = packageAppointments.filter(app => 
        app.status === 'concluido' || app.status === 'completed'
      ).length;
      
      return {
        name: pkg.service,
        total: pkg.sessions || 1,
        completed: completedSessions
      };
    });
  };

  // Funcao para calcular resumo das sessoes por tipo de procedimento
  const getSessionsSummary = (clientId: string) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]') as Appointment[];
    const completedAppointments = appointments.filter(app => 
      app.client_id === clientId && 
      (app.status === 'concluido' || app.status === 'completed')
    );
    
    const summary = completedAppointments.reduce((acc, appointment) => {
      const serviceName = appointment.service || 'Servico nao especificado';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(summary).map(([service, count]) => ({
      service,
      count
    }));
  };

  // Funcao para calcular progresso dos pacotes (apenas ativos)
  const getPackageProgress = (clientId: string) => {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]') as Appointment[];
    const sales = JSON.parse(localStorage.getItem('sales') || '[]') as Sale[];
    
    const clientPackages = sales.filter(sale => 
      sale.client_id === clientId && 
      sale.type === 'package'
    );
    
    return clientPackages.map(pkg => {
      const packageAppointments = appointments.filter(app => app.package_id === pkg.id);
      const completedSessions = packageAppointments.filter(app => 
        app.status === 'concluido' || app.status === 'completed'
      ).length;
      
      return {
        name: pkg.service,
        total: pkg.sessions || 1,
        completed: completedSessions
      };
    }).filter(pkg => pkg.completed < pkg.total); // Filtrar apenas pacotes nao finalizados
  };

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar clientes do Supabase:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os clientes do servidor.",
            variant: "destructive",
          });
        } else {
          console.log('Clientes carregados do Supabase:', data);
          setClients(data || []);
        }
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar com o servidor.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Header with Sidebar Trigger */}
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Clientes</h2>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clientes</h1>
                <p className="text-muted-foreground">Gerencie sua base de clientes</p>
              </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Cadastrar Novo Cliente
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereco</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, Avenida..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numero">Numero</Label>
                      <Input
                        id="numero"
                        value={formData.number}
                        onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="123"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                        placeholder="Centro"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Sao Paulo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="SP"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground flex-1">
                      Cadastrar Cliente
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Buscar clientes..." 
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary font-medium"
                  />
                </div>
                <Button variant="outline" className="bg-gradient-card w-full sm:w-auto">
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
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{client.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-muted-foreground mt-1 gap-1 sm:gap-0">
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{client.phone}</span>
                            </div>
                            {client.email && (
                              <div className="flex items-center">
                                <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4">
                        <div className="text-left sm:text-right">
                          <div className="text-xs md:text-sm text-muted-foreground">Ultima visita</div>
                          <div className="font-semibold text-foreground text-sm md:text-base">{client.lastVisit}</div>
                          <div className="text-xs md:text-sm text-success font-medium mt-1">{client.totalSpent}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getPackageProgress(client.id).length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
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
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card w-full sm:w-auto"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-gradient-card text-destructive hover:text-destructive w-full sm:w-auto"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o cliente {client.name}?
                                  Esta acao nao pode ser desfeita. Todos os dados relacionados a este cliente serao removidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteClient(client)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-card"
                            onClick={() => handleViewHistory(client)}
                          >
                            <History className="w-4 h-4 mr-1" />
                            Historico
                          </Button>
                          <Button variant="outline" size="sm" className="bg-gradient-card">
                            <Calendar className="w-4 h-4 mr-1" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Modal de Historico do Cliente */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historico de {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              {/* Informacoes do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Informacoes do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <p className="font-medium">{selectedClient.email || 'Nao informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente desde</p>
                      <p className="font-medium">{formatDate(selectedClient.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Sessoes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Resumo de Sessoes Realizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getSessionsSummary(selectedClient.id).length > 0 ? (
                      getSessionsSummary(selectedClient.id).map((item, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded-lg">
                          <p className="font-medium">{item.service}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.count} {item.count === 1 ? 'sessao' : 'sessoes'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-full">Nenhuma sessao realizada ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progresso dos Pacotes */}
              {getAllPackageProgress(selectedClient.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Pacotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getAllPackageProgress(selectedClient.id).map((pkg, index) => {
                        const progress = (pkg.completed / pkg.total) * 100;
                        const valuePerSession = 0; // Placeholder - voce pode calcular isso baseado no preco do pacote
                        
                        return (
                          <div key={index} className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{pkg.name}</h4>
                              <span className="text-sm text-muted-foreground">
                                Sessoes utilizadas: {pkg.completed}/{pkg.total}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mb-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              R$ {valuePerSession} por sessao
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historico de Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientHistory.length > 0 ? (
                    <div className="space-y-4">
                      {clientHistory.map((item, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h4 className="font-medium">{item.service}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.date ? formatDate(item.date) : 'Data não disponível'} as {item.time}
                                {item.packageInfo && (
                                  <span className="ml-2 text-primary">({item.packageInfo})</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  item.status === 'completed' ? 'default' :
                                  item.status === 'confirmed' ? 'secondary' : 'outline'
                                }
                              >
                                {item.status === 'completed' ? 'Concluido' :
                                 item.status === 'confirmed' ? 'Confirmado' : item.status}
                              </Badge>
                              <span className="text-sm font-medium">
                                R$ {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                                {item.type === 'package' && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    por sessao
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Nenhum historico encontrado para este cliente</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edicao de Cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
                <Input
                  id="edit-birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereco</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, Avenida..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-numero">Numero</Label>
                <Input
                  id="edit-numero"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-neighborhood">Bairro</Label>
                <Input
                  id="edit-neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Centro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Sao Paulo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-state">Estado</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="SP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-zipCode">CEP</Label>
                <Input
                  id="edit-zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground flex-1">
                Salvar Alteracoes
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}