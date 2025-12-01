import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
    try {
        console.log('🔧 Executando migração para corrigir tipo de ID em store_products...\n');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20241201_fix_store_products_id_type.sql');

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Lendo arquivo de migração:', migrationPath);

        // Tentar usar rpc 'execute_sql' (comumente configurado em projetos Supabase para migrações via cliente)
        try {
            const { data, error } = await supabase.rpc('execute_sql', {
                query: migrationSQL
            });

            if (!error) {
                console.log('✅ Migração executada com sucesso via RPC!');
                return;
            } else {
                console.log('⚠️ Erro ao executar via RPC:', error.message);
            }
        } catch (e) {
            console.log('⚠️ Função RPC não disponível');
        }

        // Se falhar, instruir manual
        console.log('\n❌ Não foi possível executar a migração automaticamente via script cliente.');
        console.log('📋 INSTRUÇÕES MANUAIS:');
        console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Vá para "SQL Editor"');
        console.log('3. Copie e execute o conteúdo do arquivo:');
        console.log(`   ${migrationPath}`);
        console.log('\nConteúdo SQL:');
        console.log('----------------------------------------');
        console.log(migrationSQL);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

executeMigration();
