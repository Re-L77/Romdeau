import { useState, useEffect } from 'react';
import { depreciacionApi } from '../../services/api';

/**
 * Hook que consume el endpoint real de depreciación.
 * Todos los cálculos se hacen en backend.
 */
export function useFinancialSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);
        const result = await depreciacionApi.getSummary();
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error al cargar datos financieros');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
