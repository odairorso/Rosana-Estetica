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
  isLoadingAppointments: boolean;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// Funções de API Supabase
const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error(error.message);
  }
  return data || [];
};

const fetchSales = async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients(name)
      `);
    
    if (error) {
      console.error("Error fetching sales:", error);
      throw new Error(error.message);
    }

    // Mapear para a estrutura de Sale esperada no frontend
    return data.map(sale => ({
      ...sale,
      price: String(sale.price), // Garantir que o preço seja string
      client: sale.clients?.name || `Cliente ID: ${sale.client_id}`, // Nome real do cliente
      sessions: sale.sessions || undefined,
      used_sessions: sale.used_sessions || 0
    })) || [];
};

const fetchAppointments = async (): Promise<Appointment[]> => {
  console.log("Attempting to fetch appointments...");
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients(name)
    `);
  
  if (error) {
    console.error("Error fetching appointments:", error);
    throw new Error(error.message);
  }

  console.log("Appointments data fetched:", data);
  console.log("Number of appointments:", data?.length || 0);

  // Mapear para a estrutura de Appointment esperada no frontend
  const mappedAppointments = data?.map(appointment => ({
    ...appointment,
    price: String(appointment.price), // Garantir que o preço seja string
    client: appointment.clients?.name || `Cliente ID: ${appointment.client_id}`, // Nome real do cliente
    clientId: appointment.client_id // Mapear o client_id para clientId
  })) || [];
  
  console.log("Mapped appointments:", mappedAppointments);
  return mappedAppointments;
};


export function SalonProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Queries
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({ queryKey: ['clients'], queryFn: fetchClients });

  const { data: sales = [], isLoading: isLoadingSales } = useQuery<Sale[]>({ 
    queryKey: ['sales'], 
    queryFn: fetchSales 
  });
  
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });

  // Mutações
  const addSaleMutation = useMutation({
    mutationFn: async (newSale: Omit<Sale, 'id'>) => {
      const { client, ...saleData } = newSale;
      const { data, error } = await supabase.from('sales').insert([saleData]).select();
      if (error) {
        console.error("Error inserting sale:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id'>) => {
      const { client, clientId, ...appointmentData } = newAppointment;
      const dataToInsert = {
        ...appointmentData,
        client_id: clientId
      };
      console.log("Inserting appointment:", dataToInsert);
      const { data, error } = await supabase.from('appointments').insert([dataToInsert]).select();
      if (error) {
        console.error("Error inserting appointment:", error);
        throw new Error(error.message);
      }
      console.log("Appointment inserted successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const scheduleFromPendingMutation = useMutation({
    mutationFn: async ({ id, time, date }: { id: number; time: string; date: string }) => {
      // Buscar a venda pendente
      const sale = sales.find(s => s.id === id);
      if (!sale) throw new Error('Venda não encontrada');

      // Criar agendamento baseado na venda
      const appointmentData = {
        client_id: sale.client_id,
        service: sale.item,
        time,
        date,
        status: 'confirmado',
        price: sale.price,
        type: sale.type,
      };

      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
      if (error) {
        console.error("Error scheduling appointment:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updatePackageSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const sale = sales.find(s => s.id === id);
      if (!sale) throw new Error('Venda não encontrada');

      const newUsedSessions = (sale.used_sessions || 0) + 1;
      const { data, error } = await supabase
        .from('sales')
        .update({ used_sessions: newUsedSessions })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating package session:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const addClientMutation = useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select();

      if (error) {
        console.error("Error adding client:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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
          const isConcluido = appointment.usedSessions !== undefined && appointment.sessions !== undefined && appointment.usedSessions >= appointment.sessions;
          appointment.status = isConcluido ? 'concluido' : 'aguardando';
          packages.push(appointment);
        }
      }
    });

    return { pendingProcedures: pending, activPackages: packages };
  }, [sales]);

  // Filtrar vendas de pacotes e mapear para a estrutura esperada
  const packages = useMemo(() => {
    const packageSales = sales.filter(sale => sale.type === 'pacote');
    
    return packageSales.map(sale => ({
      id: sale.id,
      name: sale.item,
      client: sale.client,
      sessions: sale.sessions || 0,
      usedSessions: sale.used_sessions || 0,
      price: sale.price,
      date: sale.date,
      status: sale.status
    }));
  }, [sales]);

  const value: SalonContextType = {
    clients,
    sales,
    appointments,
    pendingProcedures,
    activPackages,
    addSale: (sale) => addSaleMutation.mutate(sale),
    addAppointment: (appt) => addAppointmentMutation.mutate(appt),
    scheduleFromPending: (id, time, date) => scheduleFromPendingMutation.mutate({ id, time, date }),
    updatePackageSession: (id) => updatePackageSessionMutation.mutate(id),
    // Funções placeholder
    addClient: (client) => addClientMutation.mutate(client),
    editSale: (id, sale) => console.log('editSale not implemented', id, sale),
    deleteSale: (id) => console.log('deleteSale not implemented', id),
    isLoadingClients,
    isLoadingSales,
    isLoadingAppointments,
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
