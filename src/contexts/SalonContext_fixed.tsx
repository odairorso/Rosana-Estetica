import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
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
  discount_percentage?: number; // Desconto em porcentagem para pacotes
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
  discount_percentage?: number; // Desconto em porcentagem para pacotes
  discounted_price?: string; // Preço com desconto aplicado
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

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  sessions: number;
  procedures: string[];
  validity_days: number;
  active: boolean;
  created_at: string;
}

export interface StoreProduct {
  id: string; // UUID
  name: string;
  sku?: string;
  size?: string;
  color?: string;
  category?: string;
  price: number;
  cost_price?: number;
  stock: number;
  active: boolean;
  created_at: string;
  min_stock?: number;
  max_stock?: number;
}

export interface StoreSaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface EstheticProduct {
  id: string; // UUID
  name: string;
  category: string;
  brand: string;
  description: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  supplier: string;
  barcode?: string;
  location: string;
}

// Interface para o contexto
interface SalonContextType {
  clients: Client[];
  sales: Sale[];
  appointments: Appointment[];
  procedures: Procedure[];
  packages: Package[];
  storeProducts: StoreProduct[];
  storeSales: any[];
  estheticProducts: EstheticProduct[];
  isLoadingClients: boolean;
  isLoadingSales: boolean;
  isLoadingAppointments: boolean;
  isLoadingProcedures: boolean;
  isLoadingPackages: boolean;
  isLoadingStoreProducts: boolean;
  isLoadingStoreSales: boolean;
  isLoadingEstheticProducts: boolean;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  editClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  editSale: (id: number, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: number) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: number, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
  updatePackageSession: (saleId: number) => Promise<void>;
  scheduleFromPending: (id: number, time: string, date: string) => void;
  addStoreProduct: (product: Omit<StoreProduct, 'id' | 'created_at'>) => Promise<void>;
  updateStoreProduct: (id: string, updates: Partial<StoreProduct>) => Promise<void>;
  deleteStoreProduct: (id: string) => Promise<void>;
  addStoreSale: (payload: { client_id: number; items: StoreSaleItem[]; payment_method: string; status: string; note?: string; discount_amount?: number }) => Promise<void>;
  fetchStoreProducts: () => Promise<void>;
  addEstheticProduct: (product: Omit<EstheticProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEstheticProduct: (id: string, updates: Partial<EstheticProduct>) => Promise<void>;
  deleteEstheticProduct: (id: string) => Promise<void>;
  fetchEstheticProducts: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Queries para buscar dados
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Client[];
    },
  });

  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Sale[];
    },
  });

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Appointment[];
    },
  });

  const { data: procedures = [], isLoading: isLoadingProcedures } = useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      const { data, error } = await supabase.from('procedures').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Procedure[];
    },
  });

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packages').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Package[];
    },
  });

  const { data: storeProducts = [], isLoading: isLoadingStoreProducts } = useQuery({
    queryKey: ['store_products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_products').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as StoreProduct[];
    },
  });

  const { data: storeSales = [], isLoading: isLoadingStoreSales } = useQuery({
    queryKey: ['store_sales'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_sales').select('*').order('sale_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: estheticProducts = [], isLoading: isLoadingEstheticProducts } = useQuery({
    queryKey: ['esthetic_products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('esthetic_products').select('*').order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return data as EstheticProduct[];
    },
  });

  // Mutations para adicionar venda da loja
  const addStoreSaleMutation = useMutation({
    mutationFn: async (payload: { 
      client_id: number; 
      items: StoreSaleItem[]; 
      payment_method: string; 
      status: string; 
      note?: string;
      discount_amount?: number;
    }) => {
      // Inserir a venda na tabela store_sales
      const { data: saleData, error: saleError } = await supabase
        .from('store_sales')
        .insert([{
          client_id: payload.client_id,
          payment_method: payload.payment_method,
          status: payload.status,
          notes: payload.note || '',
          discount_amount: payload.discount_amount || 0,
          total_amount: payload.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0) - (payload.discount_amount || 0)
        }])
        .select()
        .single();

      if (saleError) throw new Error(saleError.message);

      // Inserir os itens da venda na tabela store_sale_items
      const saleItems = payload.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('store_sale_items')
        .insert(saleItems);

      if (itemsError) throw new Error(itemsError.message);

      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_sales'] });
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
    },
  });

  // Mutations para produtos estéticos
  const addEstheticProductMutation = useMutation({
    mutationFn: async (product: Omit<EstheticProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('esthetic_products').insert([product]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esthetic_products'] });
    },
  });

  const updateEstheticProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EstheticProduct> }) => {
      const allowed: Record<string, any> = {};
      if (updates.name !== undefined) allowed.name = updates.name;
      if (updates.category !== undefined) allowed.category = updates.category;
      if (updates.brand !== undefined) allowed.brand = updates.brand;
      if (updates.description !== undefined) allowed.description = updates.description;
      if (updates.unit !== undefined) allowed.unit = updates.unit;
      if (updates.cost_price !== undefined) allowed.cost_price = updates.cost_price;
      if (updates.sale_price !== undefined) allowed.sale_price = updates.sale_price;
      if (updates.stock_quantity !== undefined) allowed.stock_quantity = updates.stock_quantity;
      if (updates.min_stock !== undefined) allowed.min_stock = updates.min_stock;
      if (updates.max_stock !== undefined) allowed.max_stock = updates.max_stock;
      if (updates.supplier !== undefined) allowed.supplier = updates.supplier;
      if (updates.barcode !== undefined) allowed.barcode = updates.barcode;
      if (updates.location !== undefined) allowed.location = updates.location;

      const { data, error } = await supabase
        .from('esthetic_products')
        .update(allowed)
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esthetic_products'] });
    },
  });

  const deleteEstheticProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('esthetic_products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esthetic_products'] });
    },
  });

  // Mutations para produtos da loja
  const addStoreProductMutation = useMutation({
    mutationFn: async (product: Omit<StoreProduct, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('store_products').insert([product]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
    },
  });

  const updateStoreProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StoreProduct> }) => {
      const { data, error } = await supabase
        .from('store_products')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
    },
  });

  const deleteStoreProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('store_products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
    },
  });

  // Mutations para vendas
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
    },
  });

  // Mutations para editar/deletar vendas
  const editSaleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Sale> }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
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

  // Mutations para editar/deletar agendamentos
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

  // Mutation para atualizar sessões de pacotes
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
    
    // Buscar procedimentos pendentes das vendas
    sales.forEach(sale => {
      if (sale.type === 'procedimento') {
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
        pending.push(appointment);
      }
    });

    // Converter pacotes da tabela packages para PendingAppointment
    const packagesList: PendingAppointment[] = packages.map(pkg => ({
      id: pkg.id,
      saleId: pkg.id, // Usar o ID do pacote como saleId
      client: 'Disponível', // Pacotes não têm cliente específico
      clientId: 0, // Será definido quando o pacote for usado
      service: pkg.name,
      type: 'pacote' as const,
      price: `R$ ${pkg.price.toFixed(2)}`,
      status: 'aguardando',
      sessions: pkg.sessions,
      usedSessions: 0,
      discount_percentage: 0,
      discounted_price: `R$ ${pkg.price.toFixed(2)}`,
    }));

    return { pendingProcedures: pending, activPackages: packagesList };
  }, [sales, packages]);

  // Objeto value com todas as funções e dados
  const value: SalonContextType = {
    clients,
    sales,
    appointments,
    procedures,
    packages,
    storeProducts,
    storeSales,
    estheticProducts,
    isLoadingClients,
    isLoadingSales,
    isLoadingAppointments,
    isLoadingProcedures,
    isLoadingPackages,
    isLoadingStoreProducts,
    isLoadingStoreSales,
    isLoadingEstheticProducts,
    pendingProcedures,
    activPackages,
    // Funções implementadas
    addClient: async (client) => {
      return new Promise((resolve, reject) => {
        const { error } = mutationOptions;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    },
    editClient: async (id, client) => {
      return new Promise((resolve, reject) => {
        const { error } = mutationOptions;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    },
    deleteClient: async (id) => {
      return new Promise((resolve, reject) => {
        const { error } = mutationOptions;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    },
    // Funções implementadas
    addSale: (sale) => addSaleMutation.mutate(sale),
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
    updateAppointment: (id, updates) => updateAppointmentMutation.mutate({ id, updates }),
    deleteAppointment: (id) => deleteAppointmentMutation.mutate(id),
    updatePackageSession: (id) => updatePackageSessionMutation.mutate(id),
    scheduleFromPending: (id, time, date) => console.log('scheduleFromPending not implemented', id, time, date),
    addStoreProduct: async (product) => {
      return new Promise((resolve, reject) => {
        addStoreProductMutation.mutate(product, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    updateStoreProduct: async (id, updates) => {
      return new Promise((resolve, reject) => {
        updateStoreProductMutation.mutate({ id, updates }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    deleteStoreProduct: async (id) => {
      return new Promise((resolve, reject) => {
        deleteStoreProductMutation.mutate(id, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    addStoreSale: async (payload) => {
      return new Promise((resolve, reject) => {
        addStoreSaleMutation.mutate(payload, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    fetchStoreProducts: async () => {
      return new Promise((resolve, reject) => {
        queryClient.invalidateQueries({ queryKey: ['store_products'] });
        resolve();
      });
    },
    addEstheticProduct: async (product) => {
      return new Promise((resolve, reject) => {
        addEstheticProductMutation.mutate(product, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    updateEstheticProduct: async (id, updates) => {
      return new Promise((resolve, reject) => {
        updateEstheticProductMutation.mutate({ id, updates }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    deleteEstheticProduct: async (id) => {
      return new Promise((resolve, reject) => {
        deleteEstheticProductMutation.mutate(id, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    fetchEstheticProducts: async () => {
      return new Promise((resolve, reject) => {
        queryClient.invalidateQueries({ queryKey: ['esthetic_products'] });
        resolve();
      });
    },
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