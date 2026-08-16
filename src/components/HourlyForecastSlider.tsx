'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import type { HourlyWeather } from '@/lib/api/weather';
import { WeatherIcon, WindArrow, PrecipitationIcon } from './WeatherIcon';
import { MetricCard } from './MetricCard';
import { cn } from '@/lib/utils';

interface Props {
  hourly: HourlyWeather;
  timezone: string;
}

export function HourlyForecastSlider({ hourly, timezone }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Вычисляем индекс текущего часа
  const initialIndex = useMemo(() => {
    const now = new Date();
    const idx = hourly.time.findIndex((t) => {
      const d = new Date(t);
      return d.getHours() === now.getHours() && d.getDate() === now.getDate();
    });
    return idx >= 0 ? idx : 0;
  }, [hourly.time]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Прокрутка к выбранному элементу при изменении индекса
  const handleScrollToIndex = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (container) {
      const child = container.children[idx] as HTMLElement;
      child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  const handleSelectIndex = (idx: number) => {
    setSelectedIndex(idx);
    handleScrollToIndex(idx);
  };

  const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  };

  const formatDay = (iso: string): string => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    if (d.toDateString() === tomorrow.toDateString()) return 'Завтра';
    return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  };

  const selected = {
    time: hourly.time[selectedIndex],
    feelsLike: hourly.apparent_temperature[selectedIndex],
    windSpeed: hourly.wind_speed_10m[selectedIndex],
    windDir: hourly.wind_direction_10m[selectedIndex],
    windGusts: hourly.wind_gusts_10m[selectedIndex],
    precipProb: hourly.precipitation_probability[selectedIndex],
    precipAmount: hourly.precipitation[selectedIndex],
    rain: hourly.rain[selectedIndex],
    snow: hourly.snowfall[selectedIndex],
    cloudCover: hourly.cloud_cover[selectedIndex],
    humidity: hourly.relative_humidity_2m[selectedIndex],
    weatherCode: hourly.weather_code[selectedIndex],
    isDay: hourly.is_day[selectedIndex],
  };

  return (
    <div className="w-full">
      {/* ===== Горизонтальный скролл (как на референсе) ===== */}
      <div className="overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <div
          ref={scrollRef}
          className="flex gap-2 snap-x snap-mandatory"
        >
          {hourly.time.map((time, idx) => {
            const temp = hourly.temperature_2m[idx];
            const code = hourly.weather_code[idx];
            const precipProb = hourly.precipitation_probability[idx];
            const isDay = hourly.is_day[idx];
            const windSpeed = hourly.wind_speed_10m[idx];
            const windDir = hourly.wind_direction_10m[idx];

            return (
              <button
                key={time}
                onClick={() => handleSelectIndex(idx)}
                className={cn(
                  'flex-shrink-0 snap-center flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all min-w-[72px]',
                  'border',
                  idx === selectedIndex
                    ? 'bg-accent-blue/10 border-accent-blue shadow-md'
                    : 'bg-bg-card border-border hover:bg-bg-card-hover'
                )}
                aria-label={`Погода на ${formatTime(time)}`}
              >
                <span className="text-xs font-medium text-text-secondary">
                  {formatTime(time)}
                </span>

                <WeatherIcon code={code} isDay={isDay === 1} size={28} />

                <span
                  className={cn(
                    'text-lg font-bold',
                    temp > 30
                      ? 'text-accent-red'
                      : temp > 20
                        ? 'text-accent-orange'
                        : temp < 0
                          ? 'text-accent-blue'
                          : 'text-text-primary'
                  )}
                >
                  {Math.round(temp)}°
                </span>

                {precipProb > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-precip-blue font-medium">
                    <PrecipitationIcon size={10} />
                    {precipProb}%
                  </span>
                )}

                <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                  <WindArrow direction={windDir} size={10} />
                  {Math.round(windSpeed)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Детальная панель выбранного часа ===== */}
      <div className="mt-4 bg-bg-card border border-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {formatTime(selected.time)}
            </h3>
            <p className="text-sm text-text-secondary">
              {formatDay(selected.time)} · ощущается как {Math.round(selected.feelsLike)}°
            </p>
          </div>
          <WeatherIcon code={selected.weatherCode} isDay={selected.isDay === 1} size={48} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Ветер */}
          <MetricCard
            label="Ветер"
            icon={<WindArrow direction={selected.windDir} />}
            value={`${selected.windSpeed.toFixed(1)} м/с`}
            subvalue={`Порывы до ${selected.windGusts.toFixed(1)} м/с`}
            hint={getWindDescription(selected.windSpeed)}
          />

          {/* Осадки */}
          <MetricCard
            label="Осадки"
            icon={<PrecipitationIcon size={20} />}
            value={`${selected.precipProb}%`}
            subvalue={`${selected.precipAmount.toFixed(1)} мм`}
            hint={getPrecipitationType(selected.rain, selected.snow)}
          >
            <div className="mt-2 w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-precip-blue rounded-full transition-all"
                style={{ width: `${selected.precipProb}%` }}
              />
            </div>
          </MetricCard>

          {/* Облачность */}
          <MetricCard
            label="Облачность"
            icon={<span className="text-xl">☁️</span>}
            value={`${selected.cloudCover}%`}
            subvalue={getCloudDescription(selected.cloudCover)}
          />

          {/* Влажность */}
          <MetricCard
            label="Влажность"
            icon={<span className="text-xl">💧</span>}
            value={`${selected.humidity}%`}
            subvalue={
              selected.humidity > 80
                ? 'Высокая'
                : selected.humidity < 40
                  ? 'Низкая'
                  : 'Нормальная'
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ===== Вспомогательные функции ===== */

function getWindDescription(speed: number): string {
  if (speed < 0.5) return 'Штиль';
  if (speed < 2) return 'Тихий';
  if (speed < 4) return 'Лёгкий';
  if (speed < 6) return 'Слабый';
  if (speed < 8) return 'Умеренный';
  if (speed < 11) return 'Свежий';
  if (speed < 14) return 'Сильный';
  return 'Штормовой';
}

function getPrecipitationType(rain: number, snow: number): string {
  if (rain > 0 && snow > 0) return 'Мокрый снег';
  if (rain > 0) return 'Дождь';
  if (snow > 0) return 'Снег';
  return 'Без осадков';
}

function getCloudDescription(cover: number): string {
  if (cover < 10) return 'Ясно';
  if (cover < 40) return 'Малооблачно';
  if (cover < 70) return 'Переменная';
  if (cover < 90) return 'Облачно';
  return 'Пасмурно';
}
