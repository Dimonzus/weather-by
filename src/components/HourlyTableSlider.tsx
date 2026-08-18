'use client';

import { useMemo, useRef, useCallback } from 'react';
import type { HourlyWeather, DailyData } from '@/lib/api/weather';
import { WeatherIcon, WindArrow, getDirectionName } from './WeatherIcon';
import { cn } from '@/lib/utils';

const COL_W = 72;    // ширина колонки часа
const LABEL_W = 116; // ширина левой колонки с подписями

interface Props {
  hourly: HourlyWeather;
  daily?: DailyData;
  timezone: string;
}

/* ===== высоты строк ===== */
const H = {
  day: 40, time: 40, icon: 64, temp: 96, precip: 96,
  wdir: 88, wspd: 64, prob: 96, sun: 64, moon: 64,
};

export function HourlyTableSlider({ hourly, daily, timezone }: Props) {
  const n = hourly.time.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: timezone });

  /* Группировка часов по дням */
  const dayGroups = useMemo(() => {
    const groups: { key: string; label: string; start: number; count: number }[] = [];
    hourly.time.forEach((t, i) => {
      const key = new Date(t).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.count += 1;
      else groups.push({ key, label: dayLabel(t), start: i, count: 1 });
    });
    return groups;
  }, [hourly.time]);

  const dayStarts = useMemo(() => new Set(dayGroups.slice(1).map((g) => g.start)), [dayGroups]);

  /* График температуры */
  const temps = hourly.temperature_2m;
  const tMin = Math.min(...temps);
  const tMax = Math.max(...temps);
  const tempPts = temps.map((t, i) => ({
    x: i * COL_W + COL_W / 2,
    y: 26 + (1 - (t - tMin) / Math.max(1, tMax - tMin)) * (H.temp - 40),
  }));

  /* График вероятности осадков */
  const probs = hourly.precipitation_probability;
  const probPts = probs.map((p, i) => ({
    x: i * COL_W + COL_W / 2,
    y: 26 + (1 - p / 100) * (H.prob - 40),
  }));

  const maxPrecip = Math.max(2, ...hourly.precipitation);

  /* Маркеры солнца и луны: индекс часа -> событие */
  const sunEvents = useMemo(() => buildEvents(daily, hourly.time, 'sun'), [daily, hourly.time]);
  const moonEvents = useMemo(() => buildEvents(daily, hourly.time, 'moon'), [daily, hourly.time]);

  const nowIdx = hourly.time.findIndex((t) => new Date(t).getTime() >= Date.now());

  const cellCls = (i: number) =>
    cn(
      'flex flex-col items-center justify-center shrink-0',
      i > 0 && (dayStarts.has(i) ? 'border-l-2 border-l-border' : 'border-l border-l-border/40'),
      i === nowIdx && 'bg-accent-blue/10'
    );

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-2xl border border-border bg-bg-card scrollbar-hide cursor-grab"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="min-w-max">
          {/* ===== ДЕНЬ ===== */}
          <Row label="День" h={H.day} n={n}>
            {dayGroups.map((g) => (
              <div
                key={g.key}
                className="absolute inset-y-0 flex items-center justify-center text-xs font-semibold text-text-primary"
                style={{ left: g.start * COL_W, width: g.count * COL_W }}
              >
                {g.label}
              </div>
            ))}
          </Row>

          {/* ===== ВРЕМЯ ===== */}
          <Row label="Время" h={H.time} n={n}>
            {hourly.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.time }}>
                <span className="text-sm font-semibold text-text-primary">{fmt(t)}</span>
              </div>
            ))}
          </Row>

          {/* ===== ПРОГНОЗ (иконки) ===== */}
          <Row label="Прогноз" h={H.icon} n={n}>
            {hourly.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.icon }}>
                <WeatherIcon code={hourly.weather_code[i]} isDay={hourly.is_day[i] === 1} size={30} />
              </div>
            ))}
          </Row>

          {/* ===== ТЕМПЕРАТУРА (линия) ===== */}
          <Row label="Температура" h={H.temp} n={n}>
            <svg width={n * COL_W} height={H.temp} className="absolute inset-0">
              <polyline
                fill="none"
                stroke="rgb(var(--accent-orange))"
                strokeWidth="2"
                points={tempPts.map((p) => `${p.x},${p.y}`).join(' ')}
              />
              {tempPts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="rgb(var(--bg-card))" stroke="rgb(var(--text-primary))" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="14" fontWeight="600"
                        fill="currentColor" className="text-text-primary">
                    {Math.round(temps[i])}°
                  </text>
                </g>
              ))}
            </svg>
          </Row>

          {/* ===== ОСАДКИ (бары) ===== */}
          <Row label="Осадки" h={H.precip} n={n}>
            <div className="flex h-full">
              {hourly.precipitation.map((mm, i) => (
                <div key={i} className={cn(cellCls(i), 'justify-end pb-0')} style={{ width: COL_W, height: H.precip }}>
                  {mm > 0 && (
                    <span className="text-[11px] text-text-secondary mb-1">
                      {mm.toFixed(1).replace('.', ',')} мм
                    </span>
                  )}
                  <div
                    className="w-full bg-precip-blue"
                    style={{ height: mm > 0 ? Math.max(10, (mm / maxPrecip) * 44) : 0 }}
                  />
                </div>
              ))}
            </div>
          </Row>

          {/* ===== НАПРАВЛЕНИЕ ВЕТРА ===== */}
          <Row label="Напр. ветра" h={H.wdir} n={n}>
            {hourly.wind_direction_10m.map((deg, i) => (
              <div key={i} className={cellCls(i)} style={{ width: COL_W, height: H.wdir }}>
                <WindArrow direction={deg} size={26} />
                <span className="mt-1 text-[11px] text-text-secondary">{getDirectionName(deg)}</span>
              </div>
            ))}
          </Row>

          {/* ===== СКОРОСТЬ ВЕТРА ===== */}
          <Row label="Скор. ветра" h={H.wspd} n={n}>
            {hourly.wind_speed_10m.map((s, i) => (
              <div key={i} className={cellCls(i)} style={{ width: COL_W, height:H.wspd }}>
                <span className="text-[11px] text-text-secondary">{windDesc(s)}</span>
                <span className="text-xs font-semibold text-text-primary">{s.toFixed(0)} м/с</span>
              </div>
            ))}
          </Row>

          {/* ===== ВЕРОЯТНОСТЬ ОСАДКОВ (линия) ===== */}
          <Row label="Шанс осадков" h={H.prob} n={n}>
            <svg width={n * COL_W} height={H.prob} className="absolute inset-0">
              <polyline
                fill="none"
                stroke="rgb(var(--text-secondary))"
                strokeWidth="1.5"
                points={probPts.map((p) => `${p.x},${p.y}`).join(' ')}
              />
              {probPts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="rgb(var(--bg-card))" stroke="rgb(var(--text-secondary))" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="12" fontWeight="500"
                        fill="currentColor" className="text-text-secondary">
                    {probs[i]}%
                  </text>
                </g>
              ))}
            </svg>
          </Row>

          {/* ===== СОЛНЦЕ ===== */}
          <Row label="Солнце" h={H.sun} n={n}>
            {hourly.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.sun }}>
                {sunEvents[i] && (
                  <>
                    <span className="text-base">{sunEvents[i].type === 'sunrise' ? '🌅' : '🌇'}</span>
                    <span className="text-[11px] text-text-secondary">{fmt(sunEvents[i].time)}</span>
                  </>
                )}
              </div>
            ))}
          </Row>

          {/* ===== ЛУНА ===== */}
          <Row label="Луна" h={H.moon} n={n}>
            {hourly.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.moon }}>
                {moonEvents[i] && (
                  <>
                    <span className="text-base">🌙</span>
                    <span className="text-[11px] text-text-secondary">{fmt(moonEvents[i].time)}</span>
                  </>
                )}
              </div>
            ))}
          </Row>
        </div>
      </div>

      {/* Градиентное затухание справа */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-gradient-to-l from-bg-card to-transparent" />
    </div>
  );
}

/* ===== Строка таблицы: липкая подпись + контент ===== */
function Row({ label, h, n, children }: { label: string; h: number; n: number; children: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div
        className="sticky left-0 z-10 hidden sm:flex shrink-0 items-center border-r border-border bg-bg-card px-3"
        style={{ width: LABEL_W, height: h }}
      >
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="relative flex" style={{ width: n * COL_W, height: h }}>
        {children}
      </div>
    </div>
  );
}

/* ===== Вспомогательные ===== */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === tomorrow.toDateString()) return 'Завтра';
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' });
}

function windDesc(s: number): string {
  if (s < 0.5) return 'Штиль';
  if (s < 4) return 'Лёгкий';
  if (s < 6) return 'Слабый';
  if (s < 8) return 'Умеренный';
  if (s < 11) return 'Свежий';
  return 'Сильный';
}

function buildEvents(
  daily: DailyData | undefined,
  hours: string[],
  kind: 'sun' | 'moon'
): Record<number, { type: string; time: string }> {
  const map: Record<number, { type: string; time: string }> = {};
  if (!daily) return map;
  const idx = (iso: string) => hours.findIndex((t) => t.slice(0, 13) === iso.slice(0, 13));
  const put = (arr: string[] | undefined, type: string) =>
    arr?.forEach((iso) => {
      if (!iso) return;
      const i = idx(iso);
      if (i >= 0) map[i] = { type, time: iso };
    });
  if (kind === 'sun') {
    put(daily.sunrise, 'sunrise');
    put(daily.sunset, 'sunset');
  } else {
    put(daily.moonrise, 'moonrise');
    put(daily.moonset, 'moonset');
  }
  return map;
}