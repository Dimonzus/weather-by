// src/lib/api/weather.ts

const WEATHER_BASE = 'https://api.open-meteo.com/v1';
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1';

/* ================= Типы ================= */

export interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1: string;
  timezone: string;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  snowfall: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  cloud_cover: number[];
  relative_humidity_2m: number[];
  is_day: number[];
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyWeather;
}

/* ========= Поиск городов (геокодинг) ========= */

export async function searchCities(query: string): Promise<CityResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    name: q,
    language: 'ru',
    count: '20', // берём больше, т.к. после фильтра останутся только города РБ
  });

  try {
    const res = await fetch(`${GEO_BASE}/search?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const results: CityResult[] = data.results ?? [];

    // Приложение ориентировано строго на Беларусь — отсекаем остальные страны
    return results.filter((city) => city.country_code === 'BY');
  } catch {
    return []; // сеть недоступна — молча возвращаем пустой список
  }
}

/* ============ Почасовой прогноз ============ */

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'cloud_cover',
      'relative_humidity_2m',
      'is_day',
    ].join(','),
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
    timezone: 'auto',          // автоматически Europe/Minsk для РБ
    wind_speed_unit: 'ms',     // м/с — привычно для Беларуси
    precipitation_unit: 'mm',
    forecast_hours: '48',      // ровно 48 часов от текущего момента
  });

  const res = await fetch(`${WEATHER_BASE}/forecast?${params}`);
  if (!res.ok) throw new Error('Weather API error');

  return res.json();
}