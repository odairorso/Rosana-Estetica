import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProceduresTable() {
  console.log('🔍 Verificando estrutura do banco de dados...\n');

  try {
    // 1. Verificar se existe tabela de procedimentos
    console.log('📋 Tentando acessar tabela "procedures"...');
    const { data: procedures, error: procError } = await supabase
      .from('procedures')
      .select('*')
      .limit(5);

    if (procError) {
      console.log('❌ Tabela "procedures" não existe:', procError.message);
    } else {
      console.log('✅ Tabela "procedures" existe!');
      console.log('📊 Dados encontrados:', procedures?.length || 0);
      if (procedures && procedures.length > 0) {
        console.log('🔍 Estrutura:', Object.keys(procedures[0]));
      }
    }

    // 2. Verificar tabela sales (onde podem estar os procedimentos)
    console.log('\n📋 Verificando tabela "sales"...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('type', 'procedimento')
      .limit(10);

    if (salesError) {
      console.log('❌ Erro ao acessar sales:', salesError.message);
    } else {
      console.log('✅ Procedimentos na tabela sales:', sales?.length || 0);
      if (sales && sales.length > 0) {
        console.log('🔍 Exemplos:');
        sales.forEach((sale, index) => {
          console.log(`   ${index + 1}. ${sale.item} - ${sale.status} - Cliente: ${sale.client_id}`);
        });
      }
    }

    // 3. Verificar agendamentos relacionados
    console.log('\n📋 Verificando agendamentos de procedimentos...');
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('*, sales(*)')
      .eq('type', 'procedimento')
      .limit(10);

    if (appError) {
      console.log('❌ Erro ao acessar appointments:', appError.message);
    } else {
      console.log('✅ Agendamentos de procedimentos:', appointments?.length || 0);
      if (appointments && appointments.length > 0) {
        console.log('🔍 Exemplos:');
        appointments.forEach((app, index) => {
          console.log(`   ${index + 1}. ${app.service} - ${app.status} - ${app.date} ${app.time}`);
        });
      }
    }

    // 4. Verificar procedimentos pendentes (vendidos mas não agendados)
    console.log('\n📋 Verificando procedimentos pendentes...');
    const { data: pendingSales, error: pendingError } = await supabase
      .from('sales')
      .select(`
        *,
        appointments!left(id, status)
      `)
      .eq('type', 'procedimento')
      .eq('status', 'pago');

    if (pendingError) {
      console.log('❌ Erro ao verificar pendentes:', pendingError.message);
    } else {
      // Filtrar vendas que não têm agendamentos ou têm agendamentos não concluídos
      const reallyPending = pendingSales?.filter(sale => {
        const hasActiveAppointment = sale.appointments?.some(app => 
          app.status === 'confirmado' || app.status === 'concluido'
        );
        return !hasActiveAppointment;
      });

      console.log('✅ Procedimentos realmente pendentes:', reallyPending?.length || 0);
      if (reallyPending && reallyPending.length > 0) {
        console.log('🔍 Exemplos:');
        reallyPending.slice(0, 5).forEach((sale, index) => {
          console.log(`   ${index + 1}. ${sale.item} - Cliente: ${sale.client_id} - Data venda: ${sale.date}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkProceduresTable().catch(console.error);