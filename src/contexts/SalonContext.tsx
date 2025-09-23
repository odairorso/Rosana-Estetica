import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

// Interfaces (mantidas como no original para compatibilidade)
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
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
  client?: string; // Para exibição, mas o ID é a fonte da verdade
  client_id: number;
  service: string;
  time: string;
  date: string;
  status: 'confirmado' | 'pendente' | 'concluido' | 'faltou';
  price: string;
  type: 'procedimento' | 'pacote' | 'produto';
}

export interface Procedure {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  active: boolean;
  created_at: string;
}

interface SalonContextType {
  clients: Client[];
  sales: Sale[];
  appointments: Appointment[];
  procedures: Procedure[];
  pendingProcedures: PendingAppointment[];
  activPackages: PendingAppointment[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  editSale: (id: number, sale: Partial<Sale>) => void;
  deleteSale: (id: number) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  scheduleFromPending: (pendingId: number, time: string, date: string) => void;
  updatePackageSession: (packageId: number) => void;
  updateAppointment: (id: number, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: number) => void;
  isLoadingClients: boolean;
  isLoadingSales: boolean;
  isLoadingAppointments: boolean;
  isLoadingProcedures: boolean;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// Funções de API Supabase
const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const addClient = async (client: Omit<Client, 'id'>): Promise<void> => {
  const { error } = await supabase.from('clients').insert([client]);
  if (error) throw new Error(error.message);
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

const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase.from('appointments').select('*, clients(name)');
  if (error) throw new Error(error.message);
  // Mapear para a estrutura de Appointment esperada no frontend
  return data?.map(appointment => ({
    ...appointment,
    price: String(appointment.price), // Garantir que o preço seja string
    client: appointment.clients?.name || 'Cliente desconhecido'
  })) || [];
};

const fetchProcedures = async (): Promise<Procedure[]> => {
  const { data, error } = await supabase.from('procedures').select('*').eq('active', true);
  if (error) throw new Error(error.message);
  return data || [];
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
  
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });

  const { data: procedures = [], isLoading: isLoadingProcedures } = useQuery<Procedure[]>({
    queryKey: ['procedures'],
    queryFn: fetchProcedures,
  });

  // Mutations
  const addClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Client> }) => {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw new Error(error.message);
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

  // Mutation para adicionar agendamento
  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id'>) => {
      // Omitindo 'client' que é apenas para exibição
      const { client, ...appointmentData } = newAppointment;
      const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  // Mutation para editar venda
  const editSaleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Sale> }) => {
      // Omitindo 'client' que é apenas para exibição
      const { client, ...saleData } = updates;
      const { data, error } = await supabase
        .from('sales')
        .update(saleData)
        .eq('id', id)
        .select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  // Mutation para deletar venda
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  // Mutation para atualizar agendamento
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Appointment> }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Mutation para deletar agendamento
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Mutation para atualizar sessões de pacote
  const updatePackageSessionMutation = useMutation({
    mutationFn: async (saleId: number) => {
      // Buscar a venda atual
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();
      
      if (fetchError) throw new Error(fetchError.message);
      
      const newUsedSessions = (sale.used_sessions || 0) + 1;
      
      // Atualizar as sessões usadas
      const { data, error } = await supabase
        .from('sales')
        .update({ used_sessions: newUsedSessions })
        .eq('id', saleId)
        .select();
        
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
    procedures,
    pendingProcedures,
    activPackages,
    addSale: (sale) => addSaleMutation.mutate(sale),
    addClient: async (client) => {
      return new Promise((resolve, reject) => {
        addClientMutation.mutate(client, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    updateClient: async (id, updates) => {
      return new Promise((resolve, reject) => {
        updateClientMutation.mutate({ id, updates }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    deleteClient: async (id) => {
      return new Promise((resolve, reject) => {
        deleteClientMutation.mutate(id, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    // Funções implementadas
    editSale: (id, sale) => editSaleMutation.mutate({ id, updates: sale }),
    deleteSale: (id) => deleteSaleMutation.mutate(id),
    addAppointment: async (appt) => {
      return new Promise((resolve, reject) => {
        addAppointmentMutation.mutate(appt, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    scheduleFromPending: (id, time, date) => console.log('scheduleFromPending not implemented', id, time, date),
    updatePackageSession: (id) => updatePackageSessionMutation.mutate(id),
    updateAppointment: (id, updates) => updateAppointmentMutation.mutate({ id, updates }),
    deleteAppointment: (id) => deleteAppointmentMutation.mutate(id),
    isLoadingClients,
    isLoadingSales,
    isLoadingAppointments,
    isLoadingProcedures,
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