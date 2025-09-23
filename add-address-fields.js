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

async function addAddressFields() {
  console.log('🔄 Adicionando campos de endereço à tabela clients...')
  
  try {
    // Adicionar campos de endereço à tabela clients
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.clients 
        ADD COLUMN IF NOT EXISTS cpf TEXT,
        ADD COLUMN IF NOT EXISTS rua TEXT,
        ADD COLUMN IF NOT EXISTS numero TEXT,
        ADD COLUMN IF NOT EXISTS bairro TEXT,
        ADD COLUMN IF NOT EXISTS cidade TEXT,
        ADD COLUMN IF NOT EXISTS estado TEXT,
        ADD COLUMN IF NOT EXISTS cep TEXT;
      `
    })

    if (error) {
      console.error('❌ Erro ao adicionar campos:', error)
      return
    }

    console.log('✅ Campos de endereço adicionados com sucesso!')
    
    // Verificar se os campos foram adicionados
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'clients')
      .eq('table_schema', 'public')

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError)
      return
    }

    console.log('📋 Colunas atuais da tabela clients:')
    columns?.forEach(col => console.log(`  - ${col.column_name}`))

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
  }
}

addAddressFields()