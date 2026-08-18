'use client';

import { useMemo, useRef, useCallback } from 'react';
import type { DailyData } from '@/lib/api/weather';
import { WeatherIcon, WindArrow, getDirectionName } from './WeatherIcon';
import { cn } from '@/lib/utils';

const COL_W = 100;   // ширина колонки дня
const LABEL_W = 116; // ширина левой колонки с подписями

interface Props {
  daily: DailyData;
  timezone: string;
}

/* ===== высоты строк ===== */
const H = {
  day: 40, icon: 64, temp: 108, precip: 96,
  wdir: 88, wspd: 64, prob: 96, sun: 80, moon: 80,
};

export function DailyTableSlider({ daily, timezone }: Props) {
  const n = daily.time.length;
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

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: timezone });

  /* Группировка по дням (уже по дням, просто labels) */
  const dayLabels = useMemo(
    () => daily.time.map((t) => dayLabel(t)),
    [daily.time],
  );

  /* График температуры (max + min линии) */
  const tMax = daily.temperature_2m_max;
  const tMin = daily.temperature_2m_min;
  const allTemps = [...tMax, ...tMin];
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const tempRange = Math.max(1, globalMax - globalMin);

  const tempMaxPts = tMax.map((t, i) => ({
    x: i * COL_W + COL_W / 2,
    y: 24 + (1 - (t - globalMin) / tempRange) * (H.temp - 48),
  }));
  const tempMinPts = tMin.map((t, i) => ({
    x: i * COL_W + COL_W / 2,
    y: 24 + (1 - (t - globalMin) / tempRange) * (H.temp - 48),
  }));

  /* График вероятности осадков */
  const probs = daily.precipitation_probability_max;
  const probPts = probs.map((p, i) => ({
    x: i * COL_W + COL_W / 2,
    y: 26 + (1 - p / 100) * (H.prob - 40),
  }));

  const maxPrecip = Math.max(2, ...daily.precipitation_sum);

  const cellCls = (i: number) =>
    cn(
      'flex flex-col items-center justify-center shrink-0',
      i > 0 && 'border-l border-l-border/40',
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
        <div className="w-max">
          {/* ===== ДЕНЬ ===== */}
          <Row label="День" h={H.day} n={n}>
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className={cellCls(i)}
                style={{ width: COL_W, height: H.day }}
              >
                <span className="text-xs font-semibold text-text-primary">{label}</span>
              </div>
            ))}
          </Row>

          {/* ===== ПРОГНОЗ (иконки) ===== */}
          <Row label="Прогноз" h={H.icon} n={n}>
            {daily.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.icon }}>
                <WeatherIcon code={daily.weather_code[i]} isDay={true} size={30} />
              </div>
            ))}
          </Row>

          {/* ===== ТЕМПЕРАТУРА (линия max/min) ===== */}
          <Row label="Температура" h={H.temp} n={n}>
            <svg width={n * COL_W} height={H.temp} className="absolute inset-0">
              {/* max line */}
              <polyline
                fill="none"
                stroke="rgb(var(--accent-orange))"
                strokeWidth="2"
                points={tempMaxPts.map((p) => `${p.x},${p.y}`).join(' ')}
              />
              {/* min line */}
              <polyline
                fill="none"
                stroke="rgb(var(--accent-blue, 56 189 248))"
                strokeWidth="2"
                strokeDasharray="4 2"
                points={tempMinPts.map((p) => `${p.x},${p.y}`).join(' ')}
              />
              {/* max points + labels */}
              {tempMaxPts.map((p, i) => (
                <g key={`max-${i}`}>
                  <circle cx={p.x} cy={p.y} r="4" fill="rgb(var(--bg-card))" stroke="rgb(var(--accent-orange))" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="13" fontWeight="600"
                        fill="currentColor" className="text-text-primary">
                    {Math.round(tMax[i])}°
                  </text>
                </g>
              ))}
              {/* min points + labels */}
              {tempMinPts.map((p, i) => (
                <g key={`min-${i}`}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="rgb(var(--bg-card))" stroke="rgb(var(--text-secondary))" strokeWidth="1.5" />
                  <text x={p.x} y={p.y + 20} textAnchor="middle" fontSize="12" fontWeight="500"
                        fill="currentColor" className="text-text-secondary">
                    {Math.round(tMin[i])}°
                  </text>
                </g>
              ))}
            </svg>
          </Row>

          {/* ===== ОСАДКИ (бары) ===== */}
          <Row label="Осадки" h={H.precip} n={n}>
            <div className="flex h-full">
              {daily.precipitation_sum.map((mm, i) => (
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
            {daily.wind_direction_10m_dominant.map((deg, i) => (
              <div key={i} className={cellCls(i)} style={{ width: COL_W, height: H.wdir }}>
                <WindArrow direction={deg} size={26} />
                <span className="mt-1 text-[11px] text-text-secondary">{getDirectionName(deg)}</span>
              </div>
            ))}
          </Row>

          {/* ===== СКОРОСТЬ ВЕТРА ===== */}
          <Row label="Скор. ветра" h={H.wspd} n={n}>
            {daily.wind_speed_10m_max.map((s, i) => (
              <div key={i} className={cellCls(i)} style={{ width: COL_W, height: H.wspd }}>
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
            {daily.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.sun }}>
                <div className="flex flex-col items-center gap-1">
                  {daily.sunrise?.[i] && (
                    <div className="flex items-center gap-1">
                      <SunIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[11px] text-text-secondary">{fmtTime(daily.sunrise[i])}</span>
                    </div>
                  )}
                  {daily.sunset?.[i] && (
                    <div className="flex items-center gap-1">
                      <SunsetIcon className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[11px] text-text-secondary">{fmtTime(daily.sunset[i])}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Row>

          {/* ===== ЛУНА ===== */}
          <Row label="Луна" h={H.moon} n={n}>
            {daily.time.map((t, i) => (
              <div key={t} className={cellCls(i)} style={{ width: COL_W, height: H.moon }}>
                <div className="flex flex-col items-center gap-1">
                  {daily.moonrise?.[i] && (
                    <div className="flex items-center gap-1">
                      <MoonIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-text-secondary">{fmtTime(daily.moonrise[i])}</span>
                    </div>
                  )}
                  {daily.moonset?.[i] && (
                    <div className="flex items-center gap-1">
                      <MoonsetIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] text-text-secondary">{fmtTime(daily.moonset[i])}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Row>
        </div>
      </div>

    </div>
  );
}

/* ===== Строка таблицы: липкая подпись + контент ===== */
function Row({ label, h, n, children }: { label: string; h: number; n: number; children: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center border-r border-border bg-bg-card px-3"
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

/* ===== SVG иконки для солнца и луны ===== */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function SunsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 10V4" />
      <path d="M4.93 10.93l1.41 1.41" />
      <path d="M19.07 10.93l-1.41 1.41" />
      <path d="M17 14a5 5 0 1 0-10 0" />
      <path d="M2 18h20" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MoonsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 10V4" />
      <path d="M17 14a5 5 0 1 1-10 0" />
      <path d="M2 18h20" />
    </svg>
  );
}
