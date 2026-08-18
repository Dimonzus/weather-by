'use client';

import { useState } from 'react';
import type { HourlyWeather, DailyData } from '@/lib/api/weather';
import { HourlyTableSlider } from './HourlyTableSlider';
import { DailyTableSlider } from './DailyTableSlider';
import { cn } from '@/lib/utils';

interface Props {
  hourly: HourlyWeather;
  daily?: DailyData;
  timezone: string;
}

const tabs = [
  { key: 'hourly', label: 'Почасовой' },
  { key: 'daily', label: 'На 7 дней' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function WeatherTableTabs({ hourly, daily, timezone }: Props) {
  const [active, setActive] = useState<TabKey>('hourly');

  return (
    <div>
      {/* Вкладки */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              active === tab.key
                ? 'bg-accent-blue text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент */}
      {active === 'hourly' ? (
        <HourlyTableSlider hourly={hourly} daily={daily} timezone={timezone} />
      ) : daily ? (
        <DailyTableSlider daily={daily} timezone={timezone} />
      ) : (
        <div className="text-text-secondary text-sm py-4">Данные не загружены</div>
      )}
    </div>
  );
}
