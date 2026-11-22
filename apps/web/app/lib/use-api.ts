'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import apiCall from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(endpoint: string | null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !!endpoint,
    error: null,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!endpoint) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall<T>(endpoint);
      if (mounted.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (err) {
      if (mounted.current) {
        const message =
          err instanceof Error ? err.message : 'Terjadi kendala saat memuat data.';
        setState({ data: null, loading: false, error: message });
      }
    }
  }, [endpoint]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch, setData: (d: T) => setState({ data: d, loading: false, error: null }) };
}
