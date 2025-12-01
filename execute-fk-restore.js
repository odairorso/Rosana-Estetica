import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidos no arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
    const migrationFile = path.join(__dirname, 'supabase', 'migrations', '20241201_restore_store_products_fk.sql');

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log('Lendo arquivo de migração:', migrationFile);

        const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

        if (error) {
            console.error('Erro ao executar migração via RPC:', error);
            console.log('\n--- INSTRUÇÕES MANUAIS ---');
            console.log('Se o erro acima for sobre a função "execute_sql" não existir, você precisará executar o SQL manualmente no painel do Supabase.');
            console.log('1. Acesse https://supabase.com/dashboard/project/_/sql');
            console.log('2. Crie uma nova query');
            console.log('3. Cole o conteúdo abaixo e execute:');
            console.log('\n' + sql + '\n');
        } else {
            console.log('Migração executada com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao ler arquivo ou executar script:', err);
    }
}

executeMigration();
