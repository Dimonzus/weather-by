'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather, type WeatherResponse } from '@/lib/api/weather';

/* Автообновление прогноза каждые 10 минут */
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

interface UseWeatherReturn {
  data: WeatherResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWeather(lat: number | null, lon: number | null): UseWeatherReturn {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Защита от «гонки» запросов */
  const requestIdRef = useRef(0);
  const coordsRef = useRef({ lat, lon });

  // Синхронизация координат через ref в effect
  useEffect(() => {
    coordsRef.current = { lat, lon };
  });

  const load = useCallback(async () => {
    const { lat: currentLat, lon: currentLon } = coordsRef.current;
    if (currentLat === null || currentLon === null) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeather(currentLat, currentLon);
      if (requestId === requestIdRef.current) setData(result);
    } catch {
      if (requestId === requestIdRef.current) {
        setError('Не удалось загрузить данные о погоде');
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  /* Загрузка при смене города */
  useEffect(() => {
    load();
  }, [lat, lon, load]);

  /* Автообновление, пока страница открыта */
  useEffect(() => {
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, error, refresh: load };
}
