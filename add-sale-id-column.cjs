const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSaleIdColumn() {
  console.log('🔧 Adicionando coluna sale_id na tabela appointments...');
  
  try {
    // Usar fetch para fazer uma requisição SQL direta
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;'
      })
    });

    if (response.ok) {
      console.log('✅ Coluna sale_id adicionada com sucesso!');
    } else {
      const error = await response.text();
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar abordagem alternativa usando supabase-js
      console.log('🔄 Tentando abordagem alternativa...');
      
      const { data, error: rpcError } = await supabase.rpc('exec', {
        query: 'ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;'
      });
      
      if (rpcError) {
        console.error('❌ Erro na abordagem alternativa:', rpcError);
        console.log('');
        console.log('📋 INSTRUÇÕES MANUAIS:');
        console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
        console.log('2. Vá para seu projeto');
        console.log('3. Clique em "SQL Editor"');
        console.log('4. Execute este comando:');
        console.log('');
        console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;');
        console.log('');
      } else {
        console.log('✅ Coluna adicionada via RPC!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('');
    console.log('📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Clique em "SQL Editor"');
    console.log('4. Execute este comando:');
    console.log('');
    console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;');
    console.log('');
  }
}

addSaleIdColumn();