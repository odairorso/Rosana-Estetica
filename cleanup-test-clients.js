import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function cleanupTestClients() {
  console.log('🧹 Limpando clientes de teste...\n');

  try {
    // Buscar clientes de teste
    const { data: testClients, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .or('name.ilike.%teste%,email.ilike.%teste%,id.eq.999999');

    if (fetchError) {
      console.log('❌ Erro ao buscar clientes de teste:', fetchError.message);
      return;
    }

    if (!testClients || testClients.length === 0) {
      console.log('✅ Nenhum cliente de teste encontrado');
      return;
    }

    console.log(`📋 Encontrados ${testClients.length} clientes de teste:`);
    testClients.forEach((client, index) => {
      console.log(`   ${index + 1}. ID: ${client.id}, Nome: ${client.name}, Email: ${client.email}`);
    });

    // Remover clientes de teste
    const testIds = testClients.map(client => client.id);
    
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .in('id', testIds);

    if (deleteError) {
      console.log('❌ Erro ao deletar clientes de teste:', deleteError.message);
    } else {
      console.log(`✅ ${testClients.length} clientes de teste removidos com sucesso`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

cleanupTestClients().catch(console.error);