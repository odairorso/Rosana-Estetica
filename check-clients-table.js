import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkClientsTable() {
  console.log('🔍 Verificando estrutura da tabela clients...\n');

  try {
    // 1. Verificar estrutura da tabela clients
    console.log('📋 Verificando tabela "clients"...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientsError) {
      console.log('❌ Erro ao acessar clients:', clientsError.message);
      return;
    }

    console.log('✅ Tabela "clients" existe!');
    
    if (clients && clients.length > 0) {
      console.log('🔍 Colunas existentes:');
      const columns = Object.keys(clients[0]);
      columns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      
      console.log('\n📊 Exemplo de dados:');
      console.log(clients[0]);
    } else {
      console.log('📊 Tabela vazia, tentando inserir um cliente de teste...');
      
      // Tentar inserir um cliente simples para ver quais colunas são aceitas
      const { data: insertData, error: insertError } = await supabase
        .from('clients')
        .insert([
          {
            name: 'Teste',
            phone: '11999999999',
            email: 'teste@teste.com'
          }
        ])
        .select();

      if (insertError) {
        console.log('❌ Erro ao inserir cliente teste:', insertError.message);
      } else {
        console.log('✅ Cliente teste inserido:', insertData);
      }
    }

    // 2. Verificar se as colunas de endereço existem
    console.log('\n🏠 Verificando colunas de endereço...');
    const addressColumns = ['bairro', 'cidade', 'estado', 'cep', 'rua', 'numero'];
    
    for (const column of addressColumns) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ Coluna "${column}" não existe:`, error.message);
        } else {
          console.log(`✅ Coluna "${column}" existe`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar coluna "${column}":`, err.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkClientsTable().catch(console.error);