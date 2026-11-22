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
  const requestSequence = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!endpoint) return;
    const requestId = ++requestSequence.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall<T>(endpoint);
      if (mounted.current && requestSequence.current === requestId) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (err) {
      if (mounted.current && requestSequence.current === requestId) {
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
