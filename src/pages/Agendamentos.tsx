import { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalonSidebar } from '@/components/salon-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSalon } from '@/contexts/SalonContext';
import { EditAppointmentModal } from '@/components/edit-appointment-modal';
import { ScheduleAppointmentModal } from '@/components/schedule-appointment-modal';

export default function Agendamentos() {
  const { 
    appointments, 
    clients, 
    sales, 
    isLoadingAppointments, 
    isLoadingClients, 
    isLoadingSales,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updatePackageSession
  } = useSalon();

  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPackageSchedule, setIsPackageSchedule] = useState(false);

  const formatSafeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'concluido': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'procedimento': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pacote': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'procedimento': return 'Procedimento';
      case 'pacote': return 'Pacote';
      default: return type;
    }
  };

  const editAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const deleteAppointmentHandler = async (appointmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteAppointment(appointmentId);
        alert('Agendamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        alert('Erro ao excluir agendamento. Tente novamente.');
      }
    }
  };

  const getSessionProgress = (sale: any) => {
    if (sale.type !== 'pacote') return null;
    const used = sale.used_sessions || 0;
    const total = sale.sessions || 1;
    return `${used}/${total}`;
  };

  // Função para calcular a próxima sessão considerando agendamentos existentes
  const getNextSessionNumber = (sale: any) => {
    if (sale.type !== 'pacote') return null;
    
    // Sessões já confirmadas (concluídas)
    const confirmedSessions = sale.used_sessions || 0;
    
    // Contar agendamentos pendentes/confirmados para este pacote
    const scheduledSessions = appointments.filter(appointment => 
      appointment.sale_id === sale.id && 
      appointment.type === 'pacote' &&
      (appointment.status === 'confirmado' || appointment.status === 'concluido')
    ).length;
    
    // A próxima sessão é: sessões confirmadas + agendamentos pendentes + 1
    const nextSession = Math.max(confirmedSessions, scheduledSessions) + 1;
    
    return nextSession;
  };

  const confirmAttendance = async (appointmentId: string) => {
    try {
      // Buscar o agendamento para verificar se é um pacote
      const appointment = appointments.find(appt => appt.id === appointmentId);
      
      // Atualizar o status do agendamento
      await updateAppointment(appointmentId, { status: 'concluido' });
      
      // Se for um pacote, atualizar o contador de sessões
      if (appointment && appointment.type === 'pacote' && appointment.sale_id) {
        await updatePackageSession(appointment.sale_id);
      }
      
      alert('Presença confirmada com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      alert('Erro ao confirmar presença. Tente novamente.');
    }
  };

  const scheduleFromPendingSale = (sale: any) => {
    setSelectedSale(sale);
    setIsPackageSchedule(false);
    setIsScheduleModalOpen(true);
  };

  const schedulePackageSession = (sale: any) => {
    setSelectedSale(sale);
    setIsPackageSchedule(true);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async (date: string, time: string) => {
    if (!selectedSale) return;

    try {
      const appointmentData = {
        client_id: selectedSale.client_id,
        service: selectedSale.item,
        date: date,
        time: time,
        status: 'confirmado',
        type: selectedSale.type,
        price: selectedSale.price,
        sale_id: selectedSale.id
      };

      console.log('Criando agendamento:', appointmentData);
      await addAppointment(appointmentData);
      console.log('Agendamento criado com sucesso!');
      console.log('Agendamentos atuais:', appointments);
      
      setIsScheduleModalOpen(false);
      setSelectedSale(null);
      // Forçar uma atualização da página para garantir que os agendamentos sejam recarregados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    }
  };

  // Mostrar TODAS as vendas do caixa nos agendamentos
  const allSales = sales;

  if (isLoadingAppointments || isLoadingClients || isLoadingSales) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SalonSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
                <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
                <p className="text-muted-foreground">Gerencie os agendamentos do salão</p>
              </div>
            </div>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendamentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                    <p className="text-sm text-muted-foreground">Os agendamentos aparecerão aqui quando forem criados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 10).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{getClientName(appointment.client_id)}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.service}
                              {appointment.type === 'pacote' && appointment.sale_id && (() => {
                                const sale = sales.find(s => s.id === appointment.sale_id);
                                if (sale) {
                                  const currentSession = (sale.used_sessions || 0) + 1;
                                  const totalSessions = sale.sessions || 1;
                                  return ` - Sessão ${currentSession}/${totalSessions}`;
                                }
                                return '';
                              })()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(appointment.type)}>
                                {getTypeText(appointment.type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{formatSafeDate(appointment.date)}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time}</p>
                            <p className="text-sm text-muted-foreground">R$ {parseFloat(appointment.price).toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === 'confirmado' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => confirmAttendance(appointment.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editAppointment(appointment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => deleteAppointmentHandler(appointment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Agendar de Vendas do Caixa
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Todas as vendas registradas no caixa disponíveis para agendamento
                </p>
              </CardHeader>
              <CardContent>
                {allSales.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma venda encontrada!</p>
                    <p className="text-sm text-muted-foreground">As vendas do caixa aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Procedimentos</h4>
                      {allSales.filter(sale => sale.type === 'procedimento').map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                          <div>
                            <p className="font-medium text-foreground">{sale.item}</p>
                            <p className="text-sm text-muted-foreground">
                              {getClientName(sale.client_id)} - R$ {parseFloat(sale.price).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {formatSafeDate(sale.date)}
                            </span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">--:--</span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Button 
                              size="sm" 
                              className="bg-pink-500 hover:bg-pink-600 text-white"
                              onClick={() => scheduleFromPendingSale(sale)}
                            >
                              Agendar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-3">Pacotes</h4>
                      {allSales.filter(sale => {
                        if (sale.type !== 'pacote') return false;
                        const nextSession = getNextSessionNumber(sale);
                        const totalSessions = sale.sessions || 1;
                        // Só mostrar se ainda há sessões para agendar
                        return nextSession <= totalSessions;
                      }).map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-2">
                          <div>
                            <p className="font-medium text-foreground">{sale.item}</p>
                            <p className="text-sm text-muted-foreground">
                              {getClientName(sale.client_id)} - Próxima sessão: {getNextSessionNumber(sale)}/{sale.sessions} - R$ {parseFloat(sale.price).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {formatSafeDate(sale.date)}
                            </span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">--:--</span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Button 
                              size="sm" 
                              className="bg-pink-500 hover:bg-pink-600 text-white"
                              onClick={() => schedulePackageSession(sale)}
                            >
                              Agendar Sessão
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        appointment={editingAppointment}
      />

      <ScheduleAppointmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
        sale={selectedSale}
        isPackage={isPackageSchedule}
        clientName={selectedSale ? getClientName(selectedSale.client_id) : ''}
      />
    </SidebarProvider>
  );
}