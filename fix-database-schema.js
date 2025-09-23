import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 PROBLEMA IDENTIFICADO: Coluna sale_id não existe na tabela appointments')
console.log('📋 SOLUÇÃO OBRIGATÓRIA: Execute manualmente no painel do Supabase')
console.log('')
console.log('🌐 1. Acesse: https://supabase.com/dashboard')
console.log('📁 2. Vá para seu projeto: rsbssxvnxpewijvpzlsg')
console.log('💻 3. Clique em "SQL Editor" no menu lateral')
console.log('📝 4. Cole e execute este comando:')
console.log('')
console.log('ALTER TABLE public.appointments ADD COLUMN sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;')
console.log('')
console.log('✅ 5. Clique em "Run" para executar')
console.log('')
console.log('⚠️  IMPORTANTE: Este é o ÚNICO jeito de resolver o problema!')
console.log('⚠️  A API REST do Supabase não permite alterações de schema por segurança.')
console.log('')
console.log('🎯 Após executar o comando, o agendamento funcionará perfeitamente!')

// Vamos também verificar se conseguimos pelo menos conectar
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco...')
    const { data, error } = await supabase.from('appointments').select('*').limit(1)
    
    if (error) {
      console.log('❌ Erro de conexão:', error.message)
    } else {
      console.log('✅ Conexão OK - Banco acessível')
      console.log('📊 Colunas atuais na tabela appointments:')
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]).join(', '))
      } else {
        console.log('(Tabela vazia - não é possível ver colunas)')
      }
    }
  } catch (err) {
    console.log('❌ Erro:', err.message)
  }
}

testConnection()