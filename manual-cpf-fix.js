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

async function showManualInstructions() {
  console.log('🔧 INSTRUÇÕES PARA ADICIONAR COLUNA CPF\n');
  
  console.log('📋 PASSO A PASSO:');
  console.log('1. Acesse: https://supabase.com/dashboard');
  console.log('2. Faça login na sua conta');
  console.log('3. Selecione o projeto: rsbssxvnxpewijvpzlsg');
  console.log('4. No menu lateral, clique em "SQL Editor"');
  console.log('5. Cole e execute o seguinte comando SQL:\n');
  
  console.log('📝 COMANDO SQL:');
  console.log('   ALTER TABLE public.clients ADD COLUMN cpf TEXT;');
  console.log('');
  
  console.log('6. Clique no botão "Run" (ou pressione Ctrl+Enter)');
  console.log('7. Aguarde a confirmação de sucesso');
  console.log('8. Execute este script novamente para verificar\n');
  
  console.log('🔗 LINK DIRETO:');
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/project/default/sql/new`);
  console.log('');
  
  // Verificar se a coluna já existe
  console.log('🔍 Verificando status atual...');
  
  try {
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('cpf')
      .limit(1);

    if (!testError) {
      console.log('✅ COLUNA CPF JÁ EXISTE! Problema resolvido.');
      return true;
    }

    if (testError && testError.message.includes('cpf')) {
      console.log('❌ Coluna CPF ainda não existe');
      console.log('📋 Execute as instruções acima para resolver');
      return false;
    }

    console.log('⚠️ Erro inesperado:', testError);
    return false;
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error);
    return false;
  }
}

async function testAfterFix() {
  console.log('\n🧪 TESTANDO APÓS CORREÇÃO...');
  
  try {
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
      console.error('❌ Ainda há erro:', insertError.message);
      console.log('📋 Verifique se executou o SQL corretamente');
      return false;
    } else {
      console.log('✅ SUCESSO! Coluna CPF funcionando!');
      console.log('📋 Cliente de teste criado:', insertedClient.name);

      // Remover cliente de teste
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', insertedClient.id);

      if (!deleteError) {
        console.log('🗑️ Cliente de teste removido');
      }
      
      console.log('\n🎉 PROBLEMA RESOLVIDO!');
      console.log('✅ Agora você pode cadastrar clientes com CPF na aplicação');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar verificação
showManualInstructions().then((exists) => {
  if (exists) {
    return testAfterFix();
  } else {
    console.log('\n⏳ Execute as instruções acima e depois rode:');
    console.log('   node manual-cpf-fix.js');
    console.log('   para verificar se funcionou');
  }
});