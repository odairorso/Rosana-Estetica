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

async function addSaleIdColumn() {
  console.log('🔧 Adicionando coluna sale_id na tabela appointments...')
  
  try {
    // Primeiro, vamos verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'appointments')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.log('⚠️  Não foi possível verificar colunas existentes, tentando adicionar diretamente...')
    } else {
      const saleIdExists = columns?.some(col => col.column_name === 'sale_id')
      if (saleIdExists) {
        console.log('✅ Coluna sale_id já existe!')
        return
      }
    }
    
    // Tentar adicionar a coluna usando SQL direto
    const { data, error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;'
    })
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      console.log('\n📋 Execute manualmente no painel do Supabase:')
      console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;')
    } else {
      console.log('✅ Coluna sale_id adicionada com sucesso!')
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message)
    console.log('\n📋 Execute manualmente no painel do Supabase:')
    console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;')
  }
}

addSaleIdColumn()