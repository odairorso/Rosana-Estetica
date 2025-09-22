import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

// Interfaces (mantidas como no original para compatibilidade)
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit?: string;
  totalSpent?: string;
  packages?: number;
}

export interface Sale {
  id: number;
  client?: string; // Mantido para exibição, mas o ID é a fonte da verdade
  client_id: number;
  item: string;
  type: 'procedimento' | 'pacote' | 'produto';
  price: string;
  date: string;
  status: 'pago' | 'pendente';
  sessions?: number;
  used_sessions?: number;
}

export interface PendingAppointment {
  id: number;
  saleId: number;
  client: string;
  clientId: number;
  service: string;
  type: 'procedimento' | 'pacote' | 'produto';
  price: string;
  status: 'aguardando' | 'agendado' | 'concluido';
  sessions?: number;
  usedSessions?: number;
}

export interface Appointment {
  id: number;
  client: string;
  clientId: number;
  service: string;
  time: string;
  date: string;
  status: 'confirmado' | 'pendente';
  price: string;
  type: 'procedimento' | 'pacote' | 'produto';
}

interface SalonContextType {
  clients: Client[];
  sales: Sale[];
  appointments: Appointment[];
  pendingProcedures: PendingAppointment[];
  activPackages: PendingAppointment[];
  addClient: (client: Omit<Client, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  editSale: (id: number, sale: Partial<Sale>) => void;
  deleteSale: (id: number) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  scheduleFromPending: (pendingId: number, time: string, date: string) => void;
  updatePackageSession: (packageId: number) => void;
  isLoadingClients: boolean;
  isLoadingSales: boolean;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// Funções de API Supabase
const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase.from('sales').select('*, clients(name)');
  if (error) throw new Error(error.message);
  // Mapear para a estrutura de Sale esperada no frontend
  return data.map(sale => ({
    ...sale,
    price: String(sale.price), // Garantir que o preço seja string
    client: sale.clients?.name || 'Cliente desconhecido'
  })) || [];
};


export function SalonProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Queries
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: sales = [], isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });
  
  // TO-DO: Implementar fetch para appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => [], // Placeholder
  });

  // Mutações
  const addClientMutation = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const addSaleMutation = useMutation({
    mutationFn: async (newSale: Omit<Sale, 'id'>) => {
      // Omitindo 'client' que é apenas para exibição
      const { client, ...saleData } = newSale;
      const { data, error } = await supabase.from('sales').insert([saleData]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  // Lógica derivada (mantida no cliente)
  const { pendingProcedures, activPackages } = useMemo(() => {
    const pending: PendingAppointment[] = [];
    const packages: PendingAppointment[] = [];

    sales.forEach(sale => {
      if (sale.type !== 'produto') {
        const appointment: PendingAppointment = {
          id: sale.id,
          saleId: sale.id,
          client: sale.client || 'N/A',
          clientId: sale.client_id,
          service: sale.item,
          type: sale.type,
          price: sale.price,
          status: 'aguardando', // Status inicial
          sessions: sale.sessions,
          usedSessions: sale.used_sessions || 0,
        };
        
        if (sale.type === 'procedimento') {
          pending.push(appointment);
        } else if (sale.type === 'pacote') {
          // Lógica para determinar status do pacote
          const isConcluido = appointment.usedSessions !== undefined && appointment.sessions !== undefined && appointment.usedSessions >= appointment.sessions;
          appointment.status = isConcluido ? 'concluido' : 'aguardando';
          packages.push(appointment);
        }
      }
    });

    return { pendingProcedures: pending, activPackages: packages };
  }, [sales]);

  const value: SalonContextType = {
    clients,
    sales,
    appointments,
    pendingProcedures,
    activPackages,
    addSale: (sale) => addSaleMutation.mutate(sale),
    addClient: (client) => addClientMutation.mutate(client),
    // Funções placeholder - precisam ser implementadas com mutações
    editSale: (id, sale) => console.log('editSale not implemented', id, sale),
    deleteSale: (id) => console.log('deleteSale not implemented', id),
    addAppointment: (appt) => console.log('addAppointment not implemented', appt),
    scheduleFromPending: (id, time, date) => console.log('scheduleFromPending not implemented', id, time, date),
    updatePackageSession: (id) => console.log('updatePackageSession not implemented', id),
    isLoadingClients,
    isLoadingSales,
  };

  return (
    <SalonContext.Provider value={value}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
}
