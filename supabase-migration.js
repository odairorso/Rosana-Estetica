import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAndAddColumn() {
  console.log('🔧 Testando estrutura da tabela appointments...')
  
  try {
    // Tentar fazer um select simples para ver a estrutura
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao acessar tabela appointments:', error)
      return
    }
    
    console.log('📊 Estrutura atual da tabela appointments:')
    if (data && data.length > 0) {
      console.log('Colunas encontradas:', Object.keys(data[0]))
      
      if ('sale_id' in data[0]) {
        console.log('✅ Coluna sale_id já existe!')
        return
      } else {
        console.log('❌ Coluna sale_id NÃO existe!')
      }
    } else {
      console.log('📝 Tabela está vazia, verificando schema...')
    }
    
    // Tentar inserir um registro de teste para verificar se sale_id existe
    console.log('🧪 Testando inserção com sale_id...')
    const testInsert = await supabase
      .from('appointments')
      .insert({
        client_id: 1,
        service: 'Teste',
        date: new Date().toISOString(),
        time: '10:00',
        price: '50.00',
        sale_id: null
      })
      .select()
    
    if (testInsert.error) {
      if (testInsert.error.message.includes('sale_id')) {
        console.log('❌ Confirmado: coluna sale_id não existe!')
        console.log('\n📋 SOLUÇÃO: Execute este comando no SQL Editor do Supabase:')
        console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;')
      } else {
        console.log('❌ Erro diferente:', testInsert.error)
      }
    } else {
      console.log('✅ Teste bem-sucedido! Coluna sale_id existe e funciona.')
      // Deletar o registro de teste
      if (testInsert.data && testInsert.data[0]) {
        await supabase
          .from('appointments')
          .delete()
          .eq('id', testInsert.data[0].id)
        console.log('🗑️ Registro de teste removido.')
      }
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

testAndAddColumn()