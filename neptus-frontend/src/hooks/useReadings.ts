import { useCallback, useEffect, useRef, useState } from "react";

import { convertAPIReadingToLocal, getReadings } from "@/lib/api/readings";
import { readingsDb } from "@/lib/db";
import type { Reading } from "@/lib/db/schema";

interface UseReadingsOptions {
  tankId: string;
  perPage?: number;
}

export function useReadings({ tankId, perPage = 50 }: UseReadingsOptions) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isFetchingRef = useRef(false);

  /**
   * Busca primeira página de leituras
   */
  const fetchFirstPage = useCallback(async () => {
    if (!tankId) return;

    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      const response = await getReadings(tankId, 1, perPage);

      // Converte para formato local
      const convertedReadings = response.leituras.map((reading) =>
        convertAPIReadingToLocal(reading)
      );

      // Salva no IndexedDB
      for (const reading of convertedReadings) {
        await readingsDb.add(reading);
      }

      setReadings(convertedReadings);
      setCurrentPage(1);
      setTotalPages(response.total_paginas);
      setHasMorePages(response.pagina_atual < response.total_paginas);
    } catch (err) {
      console.error("Erro ao buscar leituras:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar leituras");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [tankId, perPage]);

  /**
   * Carrega próxima página (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (
      !tankId ||
      isLoadingMore ||
      isFetchingRef.current ||
      !hasMorePages ||
      currentPage >= totalPages
    ) {
      return;
    }

    setIsLoadingMore(true);
    isFetchingRef.current = true;

    try {
      const nextPage = currentPage + 1;
      const response = await getReadings(tankId, nextPage, perPage);

      const convertedReadings = response.leituras.map((reading) =>
        convertAPIReadingToLocal(reading)
      );

      // Salva no IndexedDB
      for (const reading of convertedReadings) {
        await readingsDb.add(reading);
      }

      // Acumula as leituras
      setReadings((prev) => [...convertedReadings, ...prev]);
      setCurrentPage(nextPage);
      setHasMorePages(nextPage < response.total_paginas);
    } catch (err) {
      console.error("Erro ao carregar mais leituras:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar mais");
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [tankId, perPage, currentPage, totalPages, hasMorePages, isLoadingMore]);

  /**
   * Busca primeira página ao montar ou quando tankId mudar
   */
  useEffect(() => {
    fetchFirstPage();
  }, [tankId, fetchFirstPage]);

  return {
    readings,
    isLoading,
    isLoadingMore,
    error,
    hasMorePages,
    currentPage,
    totalPages,
    loadMore,
    refetch: fetchFirstPage,
  };
}
