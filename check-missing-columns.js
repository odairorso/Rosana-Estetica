import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingColumns() {
  try {
    console.log('🔍 Verificando colunas faltantes na tabela clients...\n');

    // Primeiro, vamos ver a estrutura atual
    const { data: currentClients, error: selectError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao buscar clientes:', selectError);
      return;
    }

    console.log('📋 Estrutura atual da tabela (baseada em dados existentes):');
    if (currentClients.length > 0) {
      const columns = Object.keys(currentClients[0]);
      columns.forEach(col => {
        console.log(`  ✅ ${col}`);
      });
    } else {
      console.log('  Nenhum dado encontrado para verificar estrutura');
    }

    // Agora vamos tentar inserir um cliente com todos os campos esperados
    console.log('\n🧪 Testando inserção com todos os campos esperados...');
    
    const testClient = {
      name: 'Teste Colunas',
      phone: '(11) 99999-9999',
      email: 'teste.colunas@email.com',
      cpf: '123.456.789-00',
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    };

    const { data: insertedClient, error: insertError } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir cliente de teste:', insertError);
      console.log('📝 Detalhes do erro:', JSON.stringify(insertError, null, 2));
      
      // Analisar o erro para identificar colunas faltantes
      if (insertError.message && insertError.message.includes('column')) {
        const match = insertError.message.match(/'([^']+)' column/);
        if (match) {
          console.log(`\n🚨 COLUNA FALTANTE IDENTIFICADA: ${match[1]}`);
        }
      }
    } else {
      console.log('✅ Cliente de teste inserido com sucesso:');
      console.log('📋 Dados inseridos:', JSON.stringify(insertedClient, null, 2));

      // Remover cliente de teste
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', insertedClient.id);

      if (deleteError) {
        console.error('❌ Erro ao remover cliente de teste:', deleteError);
      } else {
        console.log('🗑️ Cliente de teste removido com sucesso');
      }
    }

    // Vamos tentar inserir sem o CPF para ver se é só essa coluna
    console.log('\n🧪 Testando inserção sem CPF...');
    
    const testClientWithoutCPF = {
      name: 'Teste Sem CPF',
      phone: '(11) 99999-9999',
      email: 'teste.sem.cpf@email.com',
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    };

    const { data: insertedWithoutCPF, error: insertErrorWithoutCPF } = await supabase
      .from('clients')
      .insert(testClientWithoutCPF)
      .select()
      .single();

    if (insertErrorWithoutCPF) {
      console.error('❌ Erro ao inserir sem CPF:', insertErrorWithoutCPF);
    } else {
      console.log('✅ Inserção sem CPF funcionou!');
      
      // Remover cliente de teste
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', insertedWithoutCPF.id);

      if (!deleteError) {
        console.log('🗑️ Cliente de teste removido');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkMissingColumns();