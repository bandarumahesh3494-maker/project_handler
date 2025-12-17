import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SchemaCheckResult {
  isSetup: boolean;
  loading: boolean;
  error: string | null;
  missingTables: string[];
  checkSchema: () => Promise<void>;
}

export const useSchemaCheck = (): SchemaCheckResult => {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);

  const checkSchema = async () => {
    try {
      setLoading(true);
      setError(null);

      const requiredTables = [
        'users',
        'tasks',
        'subtasks',
        'sub_subtasks',
        'milestones',
        'app_config',
        'action_history'
      ];

      const missing: string[] = [];

      for (const table of requiredTables) {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (tableError) {
          if (tableError.code === '42P01' || tableError.message.includes('does not exist')) {
            missing.push(table);
          } else if (tableError.message.includes('Failed to fetch')) {
            setError('Unable to connect to Supabase. Please check your credentials.');
            setIsSetup(false);
            setLoading(false);
            return;
          }
        }
      }

      setMissingTables(missing);
      setIsSetup(missing.length === 0);
      setLoading(false);
    } catch (err: any) {
      console.error('Error checking schema:', err);
      setError(err.message || 'Failed to check database schema');
      setIsSetup(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSchema();
  }, []);

  return {
    isSetup,
    loading,
    error,
    missingTables,
    checkSchema
  };
};
