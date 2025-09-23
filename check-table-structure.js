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

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando dados da tabela clients...\n');

    // Verificar dados existentes
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (clientsError) {
      console.error('❌ Erro ao buscar clientes:', clientsError);
      return;
    }

    console.log('📊 Dados existentes (primeiros 5 registros):');
    if (clients.length === 0) {
      console.log('  Nenhum cliente encontrado');
    } else {
      clients.forEach((client, index) => {
        console.log(`\n  Cliente ${index + 1}:`);
        console.log(`    ID: ${client.id}`);
        console.log(`    Nome: ${client.name || 'NULL'}`);
        console.log(`    Telefone: ${client.phone || 'NULL'}`);
        console.log(`    Email: ${client.email || 'NULL'}`);
        console.log(`    Rua: ${client.rua || 'NULL'}`);
        console.log(`    Número: ${client.numero || 'NULL'}`);
        console.log(`    Bairro: ${client.bairro || 'NULL'}`);
        console.log(`    Cidade: ${client.cidade || 'NULL'}`);
        console.log(`    Estado: ${client.estado || 'NULL'}`);
        console.log(`    CEP: ${client.cep || 'NULL'}`);
        console.log(`    Created At: ${client.created_at || 'NULL'}`);
      });
    }

    // Testar inserção de um cliente com dados de endereço
    console.log('\n🧪 Testando inserção de cliente com dados de endereço...');
    
    const testClient = {
      name: 'Teste Endereço',
      phone: '(11) 99999-9999',
      email: 'teste.endereco@email.com',
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

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructure();