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

async function executeCpfMigration() {
  try {
    console.log('🔧 Executando migração para adicionar coluna CPF...\n');

    // Primeiro, vamos verificar se a coluna já existe
    console.log('🔍 Verificando se a coluna CPF já existe...');
    
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('cpf')
      .limit(1);

    if (!testError) {
      console.log('✅ Coluna CPF já existe!');
      return;
    }

    if (testError && !testError.message.includes('cpf')) {
      console.error('❌ Erro inesperado:', testError);
      return;
    }

    console.log('📋 Coluna CPF não existe, tentando adicionar...');

    // Tentar diferentes abordagens para executar a migração
    const migrationSQL = `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;`;

    // Abordagem 1: Tentar usar uma função personalizada se existir
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: migrationSQL
      });
      
      if (!error) {
        console.log('✅ Migração executada com sucesso usando execute_sql!');
        return;
      }
    } catch (e) {
      console.log('⚠️ Função execute_sql não disponível');
    }

    // Abordagem 2: Tentar usar sql function
    try {
      const { data, error } = await supabase.rpc('sql', {
        query: migrationSQL
      });
      
      if (!error) {
        console.log('✅ Migração executada com sucesso usando sql!');
        return;
      }
    } catch (e) {
      console.log('⚠️ Função sql não disponível');
    }

    // Se chegou até aqui, não conseguiu executar automaticamente
    console.log('\n❌ Não foi possível executar a migração automaticamente');
    console.log('📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor" no menu lateral');
    console.log('4. Execute o seguinte comando:');
    console.log('   ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
    console.log('5. Clique em "Run" para executar');
    console.log('6. Depois execute este script novamente para verificar');

    // Vamos tentar uma última abordagem: inserir um registro com CPF para forçar a criação
    console.log('\n🔄 Tentativa final: forçar criação da coluna...');
    
    // Esta abordagem não funcionará, mas vamos documentar o erro
    const { data: forceData, error: forceError } = await supabase
      .from('clients')
      .insert({ name: 'Test', cpf: '123.456.789-00' })
      .select();

    if (forceError) {
      console.log('❌ Confirmado: coluna CPF precisa ser adicionada manualmente');
      console.log('📝 Erro:', forceError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar se a migração funcionou
async function testCpfColumn() {
  try {
    console.log('\n🧪 Testando coluna CPF...');
    
    const testClient = {
      name: 'Teste CPF Final',
      phone: '(11) 99999-9999',
      email: 'teste.cpf.final@email.com',
      cpf: '123.456.789-00'
    };

    const { data: insertedClient, error: insertError } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Coluna CPF ainda não existe:', insertError.message);
      return false;
    } else {
      console.log('✅ Coluna CPF funcionando perfeitamente!');
      console.log('📋 Cliente de teste criado:', insertedClient.name);

      // Remover cliente de teste
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', insertedClient.id);

      if (!deleteError) {
        console.log('🗑️ Cliente de teste removido');
      }
      return true;
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar migração e teste
executeCpfMigration().then(() => {
  return testCpfColumn();
}).then((success) => {
  if (success) {
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('✅ A coluna CPF foi adicionada e está funcionando');
  } else {
    console.log('\n⚠️ MIGRAÇÃO PENDENTE');
    console.log('📋 Execute manualmente no Supabase Dashboard:');
    console.log('   ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
  }
});