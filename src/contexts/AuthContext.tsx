import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão atual ao carregar
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Auth session check:', { data, error });
      if (error) {
        console.error('Failed to get session:', error);
      }
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('Auth state change:', _event, newSession);
      setSession(newSession);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);