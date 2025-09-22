import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { SalonSidebar } from '../components/salon-sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Calendar, Clock, User, DollarSign } from 'lucide-react';
import { useSalon } from '../contexts/SalonContext';
import { formatDateBR, getCurrentDateBR } from '../lib/utils';

export default function Agendamentos() {
  const { 
    appointments, 
    clients, 
    pendingProcedures, 
    activPackages, 
    addAppointment, 
    scheduleFromPending,
    isLoadingAppointments 
  } = useSalon();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    service: '',
    time: '',
    date: getCurrentDateBR(),
    price: '',
    type: 'procedimento' as 'procedimento' | 'pacote' | 'produto',
    status: 'confirmado' as 'confirmado' | 'pendente'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.service || !formData.time || !formData.date || !formData.price) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    addAppointment({
      client_id: parseInt(formData.client_id),
      client: clients.find(c => c.id === parseInt(formData.client_id))?.name || 'Cliente não encontrado',
      service: formData.service,
      time: formData.time,
      date: formData.date,
      price: formData.price,
      type: formData.type,
      status: formData.status
    });

    // Reset form
    setFormData({
      client_id: '',
      service: '',
      time: '',
      date: getCurrentDateBR(),
      price: '',
      type: 'procedimento',
      status: 'confirmado'
    });
    
    setIsDialogOpen(false);
  };

  const handleScheduleFromPending = (pendingId: number, time: string, date: string) => {
    scheduleFromPending(pendingId, time, date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <Badge variant="default" className="bg-green-500">Confirmado</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'procedimento':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Procedimento</Badge>;
      case 'pacote':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Pacote</Badge>;
      case 'produto':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Produto</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const totalAgendamentos = appointments.length;
  const agendamentosConfirmados = appointments.filter(a => a.status === 'confirmado').length;
  const agendamentosPendentes = appointments.filter(a => a.status === 'pendente').length;
  const faturamentoPrevisto = appointments
    .filter(a => a.status === 'confirmado')
    .reduce((total, a) => total + parseFloat(a.price), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Agendamentos</h2>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Gerenciar Agendamentos</h1>
                <p className="text-muted-foreground">Visualize e gerencie todos os seus agendamentos</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    Crie um novo agendamento para um cliente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Input
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      placeholder="Nome do serviço"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value: 'procedimento' | 'pacote' | 'produto') => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                        <SelectItem value="pacote">Pacote</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'confirmado' | 'pendente') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    Criar Agendamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAgendamentos}</div>
                <p className="text-xs text-muted-foreground">
                  agendamentos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{agendamentosConfirmados}</div>
                <p className="text-xs text-muted-foreground">
                  agendamentos confirmados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{agendamentosPendentes}</div>
                <p className="text-xs text-muted-foreground">
                  aguardando confirmação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Previsto</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {faturamentoPrevisto.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  dos agendamentos confirmados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Agendamentos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
              <CardDescription>
                Lista de todos os agendamentos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="text-center py-4">Carregando agendamentos...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum agendamento encontrado</p>
                  <p className="text-sm">Crie seu primeiro agendamento clicando no botão acima</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.client}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>{formatDateBR(appointment.date)}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>R$ {parseFloat(appointment.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Seção de Procedimentos Pendentes */}
          {(pendingProcedures.length > 0 || activPackages.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Agendar de Vendas Pendentes</CardTitle>
                <CardDescription>
                  Procedimentos e pacotes vendidos que ainda precisam ser agendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingProcedures.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Procedimentos Pendentes</h4>
                      <div className="space-y-2">
                        {pendingProcedures.map((pending) => (
                          <div key={pending.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{pending.service}</p>
                              <p className="text-sm text-muted-foreground">{pending.client} - R$ {pending.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Input 
                                type="date" 
                                className="w-32" 
                                id={`date-${pending.id}`} 
                                defaultValue={getCurrentDateBR()}
                              />
                              <Input type="time" className="w-24" id={`time-${pending.id}`} />
                              <Button 
                                size="sm"
                                onClick={() => {
                                  const dateInput = document.getElementById(`date-${pending.id}`) as HTMLInputElement;
                                  const timeInput = document.getElementById(`time-${pending.id}`) as HTMLInputElement;
                                  if (dateInput.value && timeInput.value) {
                                    handleScheduleFromPending(pending.id, timeInput.value, dateInput.value);
                                  } else {
                                    alert('Por favor, selecione data e horário');
                                  }
                                }}
                              >
                                Agendar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activPackages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Pacotes Pendentes</h4>
                      <div className="space-y-2">
                        {activPackages.map((package_) => (
                          <div key={package_.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{package_.service}</p>
                              <p className="text-sm text-muted-foreground">
                                {package_.client} - {package_.usedSessions}/{package_.sessions} sessões - R$ {package_.price}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Input 
                                type="date" 
                                className="w-32" 
                                id={`date-pkg-${package_.id}`} 
                                defaultValue={getCurrentDateBR()}
                              />
                              <Input type="time" className="w-24" id={`time-pkg-${package_.id}`} />
                              <Button 
                                size="sm"
                                onClick={() => {
                                  const dateInput = document.getElementById(`date-pkg-${package_.id}`) as HTMLInputElement;
                                  const timeInput = document.getElementById(`time-pkg-${package_.id}`) as HTMLInputElement;
                                  if (dateInput.value && timeInput.value) {
                                    handleScheduleFromPending(package_.id, timeInput.value, dateInput.value);
                                  } else {
                                    alert('Por favor, selecione data e horário');
                                  }
                                }}
                              >
                                Agendar Sessão
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}