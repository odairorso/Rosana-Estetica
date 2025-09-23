import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não encontradas!");
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Cliente Supabase criado com sucesso!");
  
  // Testar conexão básica
  supabase.from('clients').select('count').then(({ data, error }) => {
    if (error) {
      console.error("Erro ao conectar ao Supabase:", error.message);
    } else {
      console.log("Conexão com Supabase bem-sucedida!");
    }
  });
} catch (error) {
  console.error("Erro ao criar cliente Supabase:", error.message);
}