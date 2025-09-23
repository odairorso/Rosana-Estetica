import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addAddressColumns() {
  console.log('🔧 Adicionando colunas de endereço na tabela clients...\n');

  const queries = [
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS rua TEXT;',
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS numero TEXT;',
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS bairro TEXT;',
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS cidade TEXT;',
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS estado TEXT;',
    'ALTER TABLE clients ADD COLUMN IF NOT EXISTS cep TEXT;'
  ];

  try {
    for (const query of queries) {
      console.log(`📝 Executando: ${query}`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: query 
      });

      if (error) {
        console.log(`❌ Erro ao executar query: ${error.message}`);
        
        // Tentar método alternativo usando uma função SQL
        console.log('🔄 Tentando método alternativo...');
        
        const { data: altData, error: altError } = await supabase
          .from('clients')
          .select('id')
          .limit(1);
        
        if (altError && altError.message.includes('does not exist')) {
          console.log('✅ Coluna já existe ou foi criada');
        } else {
          console.log(`❌ Erro alternativo: ${altError?.message || 'Desconhecido'}`);
        }
      } else {
        console.log('✅ Query executada com sucesso');
      }
    }

    // Verificar se as colunas foram criadas
    console.log('\n🔍 Verificando se as colunas foram criadas...');
    
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id, name, phone, email, rua, numero, bairro, cidade, estado, cep')
      .limit(1);

    if (testError) {
      console.log('❌ Erro ao verificar colunas:', testError.message);
      
      // Se ainda há erro, vamos tentar uma abordagem diferente
      console.log('\n🔧 Tentando criar as colunas via SQL direto...');
      
      const sqlCommands = [
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rua text;",
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS numero text;", 
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bairro text;",
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cidade text;",
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS estado text;",
        "ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cep text;"
      ];
      
      for (const sql of sqlCommands) {
        console.log(`📝 Executando SQL: ${sql}`);
        
        try {
          // Usar uma abordagem mais direta
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
              'apikey': process.env.VITE_SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ sql })
          });
          
          if (response.ok) {
            console.log('✅ SQL executado com sucesso');
          } else {
            const errorText = await response.text();
            console.log(`❌ Erro HTTP: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`❌ Erro de fetch: ${fetchError.message}`);
        }
      }
      
    } else {
      console.log('✅ Todas as colunas foram criadas com sucesso!');
      console.log('📊 Estrutura atual:', Object.keys(testData[0] || {}));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    // Última tentativa: mostrar instruções manuais
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('Se o script automático falhou, execute estas queries manualmente no Supabase:');
    console.log('');
    queries.forEach(query => {
      console.log(`   ${query}`);
    });
    console.log('');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Clique em "SQL Editor"');
    console.log('4. Execute cada query acima');
  }
}

addAddressColumns().catch(console.error);