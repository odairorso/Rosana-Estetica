import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testClientSave() {
  console.log('🧪 Testando salvamento de cliente...\n');

  try {
    // Teste 1: Inserir um novo cliente (apenas campos básicos)
    console.log('📝 Teste 1: Inserindo novo cliente...');
    
    const newClient = {
      name: 'Cliente Teste',
      phone: '(11) 99999-9999',
      email: 'cliente.teste@email.com'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert([newClient])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir cliente:', insertError.message);
      return;
    }

    console.log('✅ Cliente inserido com sucesso:', insertData[0]);
    const clientId = insertData[0].id;

    // Teste 2: Atualizar o cliente
    console.log('\n📝 Teste 2: Atualizando cliente...');
    
    const updates = {
      name: 'Cliente Teste Atualizado',
      phone: '(11) 88888-8888',
      email: 'cliente.atualizado@email.com'
    };

    const { data: updateData, error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select();

    if (updateError) {
      console.log('❌ Erro ao atualizar cliente:', updateError.message);
    } else {
      console.log('✅ Cliente atualizado com sucesso:', updateData[0]);
    }

    // Teste 3: Verificar se o cliente foi salvo corretamente
    console.log('\n📝 Teste 3: Verificando cliente salvo...');
    
    const { data: fetchData, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId);

    if (fetchError) {
      console.log('❌ Erro ao buscar cliente:', fetchError.message);
    } else {
      console.log('✅ Cliente encontrado:', fetchData[0]);
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

    console.log('\n🎉 Todos os testes passaram! O salvamento de cliente está funcionando.');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

testClientSave().catch(console.error);