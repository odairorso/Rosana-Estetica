import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalSpent: string;
  packages: number;
}

export interface Sale {
  id: number;
  client: string;
  clientId: number;
  item: string;
  type: 'procedimento' | 'pacote' | 'produto';
  price: string;
  date: string;
  status: 'pago' | 'pendente';
  sessions?: number; // Para pacotes
  usedSessions?: number; // Para pacotes
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
  sessions?: number; // Para pacotes
  usedSessions?: number; // Para pacotes
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
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

// Dados iniciais
const initialClients: Client[] = [
  {
    id: 1,
    name: "Maria Silva",
    phone: "(11) 99999-9999",
    email: "maria@email.com",
    lastVisit: "15/03/2024",
    totalSpent: "R$ 1.250,00",
    packages: 2,
  },
  {
    id: 2,
    name: "Ana Costa",
    phone: "(11) 88888-8888",
    email: "ana@email.com",
    lastVisit: "12/03/2024",
    totalSpent: "R$ 890,00",
    packages: 1,
  },
  {
    id: 3,
    name: "Carla Santos",
    phone: "(11) 77777-7777",
    email: "carla@email.com",
    lastVisit: "10/03/2024",
    totalSpent: "R$ 2.100,00",
    packages: 3,
  },
];

const initialSales: Sale[] = [
  {
    id: 1,
    client: "Maria Silva",
    clientId: 1,
    item: "Pacote Facial Completo",
    type: "pacote",
    price: "R$ 300,00",
    date: "Hoje",
    status: "pago",
    sessions: 5,
    usedSessions: 1,
  },
  {
    id: 2,
    client: "Ana Costa",
    clientId: 2,
    item: "Pacote Relaxamento",
    type: "pacote",
    price: "R$ 450,00",
    date: "Hoje",
    status: "pago",
    sessions: 3,
    usedSessions: 0,
  },
  {
    id: 3,
    client: "Carla Santos",
    clientId: 3,
    item: "Pacote Corporal",
    type: "pacote",
    price: "R$ 600,00",
    date: "Hoje",
    status: "pago",
    sessions: 8,
    usedSessions: 3,
  },
  {
    id: 4,
    client: "Maria Silva",
    clientId: 1,
    item: "Pacote Anti-idade",
    type: "pacote",
    price: "R$ 800,00",
    date: "Hoje",
    status: "pago",
    sessions: 6,
    usedSessions: 6,
  },
  {
    id: 5,
    client: "Maria Silva",
    clientId: 1,
    item: "Limpeza de Pele",
    type: "procedimento",
    price: "R$ 120,00",
    date: "Hoje",
    status: "pago",
  },
  {
    id: 6,
    client: "Ana Costa",
    clientId: 2,
    item: "Massagem Relaxante",
    type: "procedimento",
    price: "R$ 80,00",
    date: "Hoje",
    status: "pago",
  },
];

export function SalonProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [sales, setSales] = useState<Sale[]>(() => {
    const savedSales = localStorage.getItem('sales');
    return savedSales ? JSON.parse(savedSales) : initialSales;
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingProcedures, setPendingProcedures] = useState<PendingAppointment[]>(() => {
    const savedPendingProcedures = localStorage.getItem('pendingProcedures');
    return savedPendingProcedures ? JSON.parse(savedPendingProcedures) : [
      {
        id: 5,
        saleId: 5,
        client: "Maria Silva",
        clientId: 1,
        service: "Limpeza de Pele",
        type: "procedimento",
        price: "R$ 120,00",
        status: "aguardando",
      },
      {
        id: 6,
        saleId: 6,
        client: "Ana Costa",
        clientId: 2,
        service: "Massagem Relaxante",
        type: "procedimento",
        price: "R$ 80,00",
        status: "aguardando",
      },
    ];
  });
  const [activPackages, setActivPackages] = useState<PendingAppointment[]>(() => {
    const savedActivPackages = localStorage.getItem('activPackages');
    return savedActivPackages ? JSON.parse(savedActivPackages) : [
      {
        id: 1,
        saleId: 1,
        client: "Maria Silva",
        clientId: 1,
        service: "Pacote Facial Completo",
        type: "pacote",
        price: "R$ 300,00",
        status: "aguardando",
        sessions: 5,
        usedSessions: 1,
      },
      {
        id: 2,
        saleId: 2,
        client: "Ana Costa",
        clientId: 2,
        service: "Pacote Relaxamento",
        type: "pacote",
        price: "R$ 450,00",
        status: "aguardando",
        sessions: 3,
        usedSessions: 0,
      },
      {
        id: 3,
        saleId: 3,
        client: "Carla Santos",
        clientId: 3,
        service: "Pacote Corporal",
        type: "pacote",
        price: "R$ 600,00",
        status: "aguardando",
        sessions: 8,
        usedSessions: 3,
      },
      {
        id: 4,
        saleId: 4,
        client: "Maria Silva",
        clientId: 1,
        service: "Pacote Anti-idade",
        type: "pacote",
        price: "R$ 800,00",
        status: "concluido",
        sessions: 6,
        usedSessions: 6,
      },
    ];
  });

  useEffect(() => {
  }, [sales]);

  useEffect(() => {
  }, [pendingProcedures]);

  useEffect(() => {
    localStorage.setItem('activPackages', JSON.stringify(activPackages));
  }, [activPackages]);

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient = {
      ...clientData,
      id: Math.max(...clients.map(c => c.id), 0) + 1,
    };
    setClients(prev => [newClient, ...prev]);
  };

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale = {
      ...saleData,
      id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
    };
    setSales(prev => [newSale, ...prev]);

    // Automaticamente criar entrada nos agendamentos apenas para procedimentos e pacotes
    if (saleData.type !== 'produto') {
      const pendingAppointment: PendingAppointment = {
        id: newSale.id,
        saleId: newSale.id,
        client: newSale.client,
        clientId: newSale.clientId,
        service: newSale.item,
        type: newSale.type,
        price: newSale.price,
        status: 'aguardando',
        sessions: newSale.sessions,
        usedSessions: newSale.usedSessions || 0,
      };

      if (saleData.type === 'procedimento') {
        setPendingProcedures(prev => [pendingAppointment, ...prev]);
      } else {
        setActivPackages(prev => [pendingAppointment, ...prev]);
      }
    }
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointmentData,
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
    };
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const scheduleFromPending = (pendingId: number, time: string, date: string) => {
    // Encontrar o item pendente
    const pendingProcedure = pendingProcedures.find(p => p.id === pendingId);
    const pendingPackage = activPackages.find(p => p.id === pendingId);
    
    const pending = pendingProcedure || pendingPackage;
    if (!pending) return;

    // Criar agendamento
    const newAppointment: Appointment = {
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      client: pending.client,
      clientId: pending.clientId,
      service: pending.service,
      time,
      date,
      status: 'confirmado',
      price: pending.price,
      type: pending.type,
    };

    setAppointments(prev => [newAppointment, ...prev]);

    // Remover dos pendentes se for procedimento
    if (pending.type === 'procedimento') {
      setPendingProcedures(prev => prev.filter(p => p.id !== pendingId));
    }
    // Se for pacote, apenas marcar como agendado mas manter na lista
    else {
      setActivPackages(prev => 
        prev.map(p => p.id === pendingId ? { ...p, status: 'agendado' as const } : p)
      );
    }
  };

  const editSale = (id: number, saleData: Partial<Sale>) => {
    setSales(prev => prev.map(sale => sale.id === id ? { ...sale, ...saleData } : sale));
    
    // Update corresponding pending appointments - only update compatible fields
    const appointmentUpdate = {
      ...(saleData.client && { client: saleData.client }),
      ...(saleData.clientId && { clientId: saleData.clientId }),
      ...(saleData.item && { service: saleData.item }),
      ...(saleData.type && { type: saleData.type }),
      ...(saleData.price && { price: saleData.price }),
      ...(saleData.sessions && { sessions: saleData.sessions }),
      ...(saleData.usedSessions !== undefined && { usedSessions: saleData.usedSessions }),
    };
    
    if (saleData.type === 'procedimento' || sales.find(s => s.id === id)?.type === 'procedimento') {
      setPendingProcedures(prev => prev.map(p => 
        p.saleId === id ? { ...p, ...appointmentUpdate } : p
      ));
    } else {
      setActivPackages(prev => prev.map(p => 
        p.saleId === id ? { ...p, ...appointmentUpdate } : p
      ));
    }
  };

  const deleteSale = (id: number) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    setSales(prev => prev.filter(s => s.id !== id));
    
    // Remove corresponding pending appointments
    if (sale.type === 'procedimento') {
      setPendingProcedures(prev => prev.filter(p => p.saleId !== id));
    } else {
      setActivPackages(prev => prev.filter(p => p.saleId !== id));
    }
  };

  const updatePackageSession = (packageId: number) => {
    setActivPackages(prev => 
      prev.map(p => {
        if (p.id === packageId && p.sessions && p.usedSessions !== undefined) {
          const newUsedSessions = p.usedSessions + 1;
          return {
            ...p,
            usedSessions: newUsedSessions,
            status: newUsedSessions >= p.sessions ? 'concluido' as const : 'aguardando' as const
          };
        }
        return p;
      })
    );
  };

  const value = {
    clients,
    sales,
    appointments,
    pendingProcedures,
    activPackages,
    addClient,
    addSale,
    editSale,
    deleteSale,
    addAppointment,
    scheduleFromPending,
    updatePackageSession,
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