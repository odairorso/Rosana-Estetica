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

export interface EstheticProduct {
  id: string; // UUID
  name: string;
  category: string;
  brand: string;
  description: string;
  unit: string;
  cost_price: number;
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
      payment_status: payload.status === 'paga' ? 'paid' : 'pending', // Mapear para os valores do banco
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
    total_price: item.quantity * item.unit_price // Nome correto da coluna
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
    if (updates.expiration_date !== undefined) allowed.expiration_date = updates.expiration_date;
    if (updates.is_active !== undefined) allowed.is_active = updates.is_active;

    const { error } = await supabase.from('esthetic_products').update(allowed).eq('id', id);
    if (error) throw new Error(error.message);
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
    price: String(pkg.price),
    status: 'aguardando' as const,
    sessions: pkg.sessions,
    usedSessions: 0,
    discount_percentage: 0,
    discounted_price: String(pkg.price),
  }));

  return { pendingProcedures: pending, activPackages: packagesList };
}, [sales, packages]);

const value: SalonContextType = {
  clients,
  sales,
  appointments,
  procedures,
  packages,
  pendingProcedures,
  activPackages,
  logoUrl,
  setLogoUrl,

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
  isLoadingPackages,
  storeProducts,
  storeSales,
  isLoadingStoreProducts,
  isLoadingStoreSales,
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
  estheticProducts,
  isLoadingEstheticProducts,
  fetchEstheticProducts: async () => {
    return new Promise((resolve, reject) => {
      queryClient.invalidateQueries({ queryKey: ['esthetic_products'] });
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
  fetchStoreProducts: async () => {
    return new Promise((resolve, reject) => {
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
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