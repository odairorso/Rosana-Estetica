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
  expiration_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface StoreSale {
  id: number;
  client_id: number | null;
  date: string;
  status: 'aberta' | 'paga' | 'cancelada';
  payment_method?: string;
  total: number;
  discount?: number;
  note?: string;
}

interface SalonContextType {
  clients: Client[];
  sales: Sale[];
  appointments: Appointment[];
  procedures: Procedure[];
  packages: Package[];
  pendingProcedures: PendingAppointment[];
  activPackages: PendingAppointment[];
  logoUrl: string;
  setLogoUrl: (url: string) => void;
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
  isLoadingPackages: boolean;
  storeProducts: StoreProduct[];
  storeSales: StoreSale[];
  isLoadingStoreProducts: boolean;
  isLoadingStoreSales: boolean;
  addStoreProduct: (product: Omit<StoreProduct, 'id' | 'created_at' | 'stock' | 'active'> & { stock?: number; active?: boolean }) => Promise<void>;
  updateStoreProduct: (id: string, updates: Partial<StoreProduct>) => Promise<void>;
  deleteStoreProduct: (id: string) => Promise<void>;
  addStoreSale: (payload: { client_id: number | null; items: StoreSaleItem[]; payment_method: string; status: 'paga' | 'pendente'; discount?: number; note?: string }) => Promise<void>;
  estheticProducts: EstheticProduct[];
  isLoadingEstheticProducts: boolean;
  fetchEstheticProducts: () => Promise<void>;
  addEstheticProduct: (product: Omit<EstheticProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEstheticProduct: (id: string, updates: Partial<EstheticProduct>) => Promise<void>;
  deleteEstheticProduct: (id: string) => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// Funções de API Supabase
const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const addClient = async (client: Omit<Client, 'id'>): Promise<void> => {
  // Incluir todas as colunas agora que foram criadas no Supabase
  const allowedFields = {
    name: client.name,
    phone: client.phone,
    email: client.email,
    rua: client.rua,
    numero: client.numero,
    bairro: client.bairro,
    cidade: client.cidade,
    estado: client.estado,
    cep: client.cep,
  };
  
  const { error } = await supabase.from('clients').insert([allowedFields]);
  if (error) throw new Error(error.message);
};

const fetchSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      clients (
        name
      )
    `)
    .order('date', { ascending: false });
  
  if (error) throw new Error(error.message);
  
  // Mapear os dados para incluir o nome do cliente
  return (data || []).map(sale => ({
    ...sale,
    price: String(sale.price), // Garantir que o preço seja string
    client: sale.clients?.name || 'Cliente não encontrado'
  }));
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
  const { data, error } = await supabase.from('procedures').select('*').eq('is_active', true);
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchPackages = async (): Promise<Package[]> => {
  const { data, error } = await supabase.from('packages').select('*').eq('is_active', true);
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchStoreProducts = async (): Promise<StoreProduct[]> => {
  const { data, error } = await supabase
    .from('store_products')
    .select('id, name, sku, size, color, category, sale_price, cost_price, stock_quantity, is_active, min_stock, max_stock, created_at')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  const rows = (data || []) as any[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku || undefined,
    size: row.size || undefined,
    color: row.color || undefined,
    category: row.category || undefined,
    price: Number(row.sale_price || 0),
    cost_price: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : undefined,
    stock: Number(row.stock_quantity || 0),
    active: !!row.is_active,
    min_stock: row.min_stock !== null && row.min_stock !== undefined ? Number(row.min_stock) : undefined,
    max_stock: row.max_stock !== null && row.max_stock !== undefined ? Number(row.max_stock) : undefined,
    created_at: row.created_at,
  }));
};

const fetchEstheticProducts = async (): Promise<EstheticProduct[]> => {
  const { data, error } = await supabase.from('esthetic_products').select('*').eq('is_active', true);
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchStoreSales = async (): Promise<StoreSale[]> => {
  const { data, error } = await supabase.from('store_sales').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export function SalonProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [logoUrl, setLogoUrlState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('salonLogo') || '/logo.png';
    }
    return '/logo.png';
  });

  const setLogoUrl = (url: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonLogo', url);
    }
    setLogoUrlState(url);
  };

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

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: fetchPackages,
  });

  const { data: storeProducts = [], isLoading: isLoadingStoreProducts } = useQuery<StoreProduct[]>({
    queryKey: ['store_products'],
    queryFn: fetchStoreProducts,
  });

  const { data: storeSales = [], isLoading: isLoadingStoreSales } = useQuery<StoreSale[]>({
    queryKey: ['store_sales'],
    queryFn: fetchStoreSales,
  });

  const { data: estheticProducts = [], isLoading: isLoadingEstheticProducts } = useQuery<EstheticProduct[]>({
    queryKey: ['esthetic_products'],
    queryFn: fetchEstheticProducts,
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
      // Incluir todas as colunas agora que foram criadas no Supabase
      const allowedUpdates: Partial<Client> = {};
      
      // Incluir todos os campos disponíveis na tabela
      if (updates.name !== undefined) allowedUpdates.name = updates.name;
      if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
      if (updates.email !== undefined) allowedUpdates.email = updates.email;
      if (updates.rua !== undefined) allowedUpdates.rua = updates.rua;
      if (updates.numero !== undefined) allowedUpdates.numero = updates.numero;
      if (updates.bairro !== undefined) allowedUpdates.bairro = updates.bairro;
      if (updates.cidade !== undefined) allowedUpdates.cidade = updates.cidade;
      if (updates.estado !== undefined) allowedUpdates.estado = updates.estado;
      if (updates.cep !== undefined) allowedUpdates.cep = updates.cep;
      
      const { error } = await supabase
        .from('clients')
        .update(allowedUpdates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const addStoreProductMutation = useMutation({
    mutationFn: async (product: Omit<StoreProduct, 'id' | 'created_at' | 'stock' | 'active'> & { stock?: number; active?: boolean }) => {
      const payload = {
        name: product.name,
        sku: product.sku,
        size: product.size,
        color: product.color,
        category: product.category,
        sale_price: product.price,
        cost_price: product.cost_price,
        stock_quantity: product.stock ?? 0,
        is_active: product.active ?? true,
      } as any;
      const { error } = await supabase.from('store_products').insert([payload]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_products'] });
    },
  });

  const updateStoreProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StoreProduct> }) => {
      const allowed: Record<string, any> = {};
      if (updates.name !== undefined) allowed.name = updates.name;
      if (updates.sku !== undefined) allowed.sku = updates.sku;
      if (updates.size !== undefined) allowed.size = updates.size;
      if (updates.color !== undefined) allowed.color = updates.color;
      if (updates.category !== undefined) allowed.category = updates.category;
      if (updates.price !== undefined) allowed.sale_price = updates.price;
      if (updates.cost_price !== undefined) allowed.cost_price = updates.cost_price;
      if (updates.stock !== undefined) allowed.stock_quantity = updates.stock;
      if (updates.active !== undefined) allowed.is_active = updates.active;
      const { error } = await supabase.from('store_products').update(allowed).eq('id', id);
      if (error) throw new Error(error.message);
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

  const addStoreSaleMutation = useMutation({
    mutationFn: async (payload: { client_id: number | null; items: StoreSaleItem[]; payment_method: string; status: 'paga' | 'pendente'; discount?: number; note?: string }) => {
      const total = payload.items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0) - (payload.discount || 0);
      const { data: saleRow, error: saleError } = await supabase
        .from('store_sales')
        .insert([{ client_id: payload.client_id, status: payload.status === 'paga' ? 'paga' : 'aberta', payment_method: payload.payment_method, total, discount: payload.discount || 0, note: payload.note }])
        .select()
        .single();
      if (saleError) throw new Error(saleError.message);
      const saleId = saleRow.id as number;

      const itemsPayload = payload.items.map(it => ({ sale_id: saleId, product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price, subtotal: it.unit_price * it.quantity }));
      const { error: itemsError } = await supabase.from('store_sale_items').insert(itemsPayload);
      if (itemsError) throw new Error(itemsError.message);

      const movements = payload.items.map(it => ({ product_id: it.product_id, type: 'saida', quantity: it.quantity }));
      const { error: moveError } = await supabase.from('store_inventory_movements').insert(movements);
      if (moveError) throw new Error(moveError.message);

      const { error: finError } = await supabase.from('financial_transactions').insert([{ scope: 'loja', source: 'sale', source_id: saleId, type: 'receita', method: payload.payment_method, amount: total, status: payload.status === 'paga' ? 'pago' : 'pendente' }]);
      if (finError) throw new Error(finError.message);
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
