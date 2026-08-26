// src/app/page.tsx
'use client';

import { useState } from 'react';
import { CitySearch } from '@/components/CitySearch';
//import { HourlyForecastSlider } from '@/components/HourlyForecastSlider';
import { CurrentWeatherCard } from '@/components/CurrentWeatherCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWeather } from '@/hooks/useWheather';
import type { CityResult } from '@/lib/api/weather';
import { WeatherTableTabs } from '@/components/WeatherTableTabs';

const DEFAULT_CITY: CityResult = {
  id: 628096,
  name: 'Гродно',
  latitude: 53.62865,
  longitude: 23.8942,
  country: 'Беларусь',
  admin1: 'Гродненская область',
  timezone: 'Europe/Minsk',
};

export default function Home() {
  const [city, setCity] = useState<CityResult>(DEFAULT_CITY);
  const { data, loading, error, refresh } = useWeather(city.latitude, city.longitude);

  return (
    <main className="min-h-screen bg-bg-primary transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Шапка: лого + поиск + переключатель темы */}
        <header className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary whitespace-nowrap">
            🌤️ Погода Беларусь
          </h1>
          <div className="flex-1 w-full">
            <CitySearch onSelect={setCity} />
          </div>
          <ThemeToggle />
        </header>

        {/* Выбранный город */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary truncate">{city.name}</h2>
              <p className="text-sm text-text-secondary">{city.admin1}, Беларусь</p>
            </div>
            <button
              onClick={refresh}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-sm text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Обновить
            </button>
          </div>
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
                Прогноз погоды
              </h3>
              <WeatherTableTabs hourly={data.hourly} daily={data.daily} timezone={data.timezone} />
            </section>
          </>
        )}

        <footer className="mt-8 sm:mt-10 pb-6 text-center text-xs text-text-muted space-y-1">
          <div>
            Данные:{' '}
            <a
              href="https://open-meteo.com/"
              className="text-accent-blue hover:underline"
              target="_blank"
              rel="noopener"
            >
              Open-Meteo
            </a>
          </div>
          <div>Copyright by DimaZ</div>
        </footer>
      </div>
    </main>
  );
}