'use client';

import { WeatherIcon } from './WeatherIcon';
import { getDirectionName } from './WeatherIcon';

interface Props {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Ясно',
  1: 'Малооблачно',
  2: 'Переменная облачность',
  3: 'Пасмурно',
  45: 'Туман', 48: 'Изморозь',
  51: 'Лёгкая морось', 53: 'Морось', 55: 'Сильная морось',
  61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь',
  71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снег',
  80: 'Кратковременный дождь', 81: 'Ливень', 82: 'Сильный ливень',
  95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза',
};

export function CurrentWeatherCard({ current }: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-6xl md:text-7xl font-bold text-text-primary">
            {Math.round(current.temperature_2m)}°
          </div>
          <div className="text-lg text-text-secondary mt-2">
            {WMO_DESCRIPTIONS[current.weather_code] || 'Погода'}
          </div>
        </div>

        <WeatherIcon code={current.weather_code} isDay={true} size={96} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <div className="text-xs text-text-muted uppercase tracking-wide">Ветер</div>
          <div className="text-sm sm:text-base font-semibold text-text-primary break-words">
            {current.wind_speed_10m.toFixed(1)} м/с, {getDirectionName(current.wind_direction_10m)}
          </div>
        </div>
      </div>
    </div>
  );
}