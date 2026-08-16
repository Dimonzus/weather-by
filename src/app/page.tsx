// src/app/page.tsx
'use client';

import { useState } from 'react';
import { CitySearch } from '@/components/CitySearch';
import { HourlyForecastSlider } from '@/components/HourlyForecastSlider';
import { CurrentWeatherCard } from '@/components/CurrentWeatherCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWeather } from '@/hooks/useWheather';
import type { CityResult } from '@/lib/api/weather';

const DEFAULT_CITY: CityResult = {
  id: 625144,
  name: 'Минск',
  latitude: 53.9,
  longitude: 27.5667,
  country: 'Беларусь',
  admin1: 'Минская область',
  timezone: 'Europe/Minsk',
};

export default function Home() {
  const [city, setCity] = useState<CityResult>(DEFAULT_CITY);
  const { data, loading, error, refresh } = useWeather(city.latitude, city.longitude);

  return (
    <main className="min-h-screen bg-bg-primary transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Шапка: лого + поиск + переключатель темы */}
        <header className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-text-primary whitespace-nowrap">
            🌤️ Погода.BY
          </h1>
          <div className="flex-1 w-full">
            <CitySearch onSelect={setCity} />
          </div>
          <ThemeToggle />
        </header>

        {/* Выбранный город */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">{city.name}</h2>
            <p className="text-text-secondary">{city.admin1}, Беларусь</p>
          </div>
          <button onClick={refresh} className="text-sm text-accent-blue hover:underline">
            Обновить
          </button>
        </div>

        {/* Загрузка */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="bg-accent-red/10 border border-accent-red text-accent-red rounded-2xl p-4 text-center">
            {error}{' '}
            <button onClick={refresh} className="underline">
              Повторить
            </button>
          </div>
        )}

        {/* Основной контент */}
        {data && !loading && (
          <>
            <CurrentWeatherCard current={data.current} />

            <section className="mt-8">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Почасовой прогноз на 48 часов
              </h3>
              <HourlyForecastSlider hourly={data.hourly} timezone={data.timezone} />
            </section>
          </>
        )}

        <footer className="mt-10 text-center text-xs text-text-muted">
          Данные о погоде:{' '}
          <a href="https://open-meteo.com/" className="underline" target="_blank" rel="noopener">
            Open-Meteo
          </a>
        </footer>
      </div>
    </main>
  );
}