import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCompleteClientSave() {
  console.log('🧪 Testando salvamento completo de cliente com endereço...\n');

  try {
    // Teste 1: Inserir um novo cliente com dados completos
    console.log('📝 Teste 1: Inserindo cliente completo...');
    
    const newClient = {
      name: 'ODAIR ROBERTO DOS SANTOS DE OLIVEIRA',
      phone: '67999748109',
      email: 'odair_orso@hotmail.com',
      rua: 'Rua das Flores, 123',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Campo Grande',
      estado: 'MS',
      cep: '79000-000'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert([newClient])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir cliente:', insertError.message);
      console.log('Detalhes do erro:', insertError);
      return;
    }

    console.log('✅ Cliente inserido com sucesso:');
    console.log('   ID:', insertData[0].id);
    console.log('   Nome:', insertData[0].name);
    console.log('   Telefone:', insertData[0].phone);
    console.log('   Email:', insertData[0].email);
    console.log('   Rua:', insertData[0].rua);
    console.log('   Número:', insertData[0].numero);
    console.log('   Bairro:', insertData[0].bairro);
    console.log('   Cidade:', insertData[0].cidade);
    console.log('   Estado:', insertData[0].estado);
    console.log('   CEP:', insertData[0].cep);
    
    const clientId = insertData[0].id;

    // Teste 2: Atualizar o cliente com novos dados de endereço
    console.log('\n📝 Teste 2: Atualizando endereço do cliente...');
    
    const updates = {
      rua: 'Avenida Brasil, 456',
      numero: '456',
      bairro: 'Jardim dos Estados',
      cidade: 'Campo Grande',
      estado: 'MS',
      cep: '79020-000'
    };

    const { data: updateData, error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select();

    if (updateError) {
      console.log('❌ Erro ao atualizar cliente:', updateError.message);
      console.log('Detalhes do erro:', updateError);
    } else {
      console.log('✅ Cliente atualizado com sucesso:');
      console.log('   Rua:', updateData[0].rua);
      console.log('   Número:', updateData[0].numero);
      console.log('   Bairro:', updateData[0].bairro);
      console.log('   Cidade:', updateData[0].cidade);
      console.log('   Estado:', updateData[0].estado);
      console.log('   CEP:', updateData[0].cep);
    }

    // Teste 3: Verificar se todos os dados foram salvos corretamente
    console.log('\n📝 Teste 3: Verificando dados salvos...');
    
    const { data: fetchData, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId);

    if (fetchError) {
      console.log('❌ Erro ao buscar cliente:', fetchError.message);
    } else {
      console.log('✅ Dados completos do cliente:');
      console.log(fetchData[0]);
    }

    // Teste 4: Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (deleteError) {
      console.log('❌ Erro ao deletar cliente de teste:', deleteError.message);
    } else {
      console.log('✅ Cliente de teste removido com sucesso');
    }

    console.log('\n🎉 Todos os testes passaram! O salvamento completo está funcionando.');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

testCompleteClientSave().catch(console.error);