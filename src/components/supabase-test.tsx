import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const SupabaseTest = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAllTables = async () => {
      const tables = ['clients', 'sales', 'appointments'];
      const testResults: Record<string, any> = {};

      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' });
          
          if (error) {
            testResults[table] = { error: error.message, status: 'erro' };
          } else {
            testResults[table] = { 
              status: 'ok', 
              count: count || 0,
              data: data?.slice(0, 2) // Primeiros 2 registros
            };
          }
        } catch (err) {
          testResults[table] = { 
            error: err instanceof Error ? err.message : 'Erro desconhecido',
            status: 'erro'
          };
        }
      }

      setResults(testResults);
      setLoading(false);
    };

    testAllTables();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 border border-blue-400 rounded">
        <h3 className="font-bold text-lg">Testando Conexão Supabase...</h3>
        <p>Verificando tabelas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-400 rounded">
      <h3 className="font-bold text-lg">Teste de Conexão Supabase</h3>
      {Object.entries(results).map(([table, result]) => (
        <div key={table} className="mt-2 p-2 border rounded">
          <h4 className="font-semibold">{table}:</h4>
          {result.status === 'ok' ? (
            <div className="text-green-600">
              ✅ OK - {result.count} registros
              {result.data && result.data.length > 0 && (
                <pre className="text-xs mt-1 bg-gray-50 p-1 rounded">
                  {JSON.stringify(result.data[0], null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Erro: {result.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};