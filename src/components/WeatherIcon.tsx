'use client';

interface IconProps {
  code: number;
  isDay: boolean;
  size?: number;
}

export function WeatherIcon({ code, isDay, size = 28 }: IconProps) {
  // Упрощённая SVG-иконка на основе WMO кода
  const getColor = () => {
    if (!isDay) return '#94A3B8';
    if (code === 0 || code === 1) return '#FBBF24';
    if (code >= 61 && code <= 67) return '#3B82F6';
    if (code >= 71 && code <= 77) return '#CBD5E1';
    if (code >= 95) return '#F59E0B';
    return '#94A3B8';
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {code === 0 && (
        <circle cx="12" cy="12" r="6" fill={getColor()} />
      )}
      {code >= 1 && code <= 3 && (
        <path d="M17 18H7a4 4 0 01-1-7.9 5 5 0 019.9-1A4 4 0 0117 18z" fill={getColor()} />
      )}
      {code >= 45 && code <= 48 && (
        <path d="M3 12h18M3 8h18M3 16h18" stroke={getColor()} strokeWidth="2" strokeLinecap="round" />
      )}
      {code >= 51 && code <= 67 && (
        <>
          <path d="M17 10H7a4 4 0 01-1-7.9 5 5 0 019.9-1A4 4 0 0117 10z" fill={getColor()} opacity="0.6" />
          <path d="M8 15l-1 3M12 15l-1 3M16 15l-1 3" stroke={getColor()} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {code >= 71 && code <= 77 && (
        <>
          <path d="M17 10H7a4 4 0 01-1-7.9 5 5 0 019.9-1A4 4 0 0117 10z" fill={getColor()} opacity="0.6" />
          <circle cx="8" cy="15" r="1" fill={getColor()} />
          <circle cx="12" cy="17" r="1" fill={getColor()} />
          <circle cx="16" cy="15" r="1" fill={getColor()} />
        </>
      )}
      {code >= 95 && (
        <>
          <path d="M17 10H7a4 4 0 01-1-7.9 5 5 0 019.9-1A4 4 0 0117 10z" fill="#64748B" />
          <path d="M12 13l-3 6h4l-2 4" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function WindArrow({ direction, size = 24 }: { direction: number; size?: number }) {
  const rotation = direction;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s' }}>
      <path d="M12 2 L16 18 L12 14 L8 18 Z" fill="rgb(var(--wind-gray))" />
    </svg>
  );
}

export function PrecipitationIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z" fill="rgb(var(--precip-blue))" />
    </svg>
  );
}

export function getDirectionName(deg: number): string {
  const dirs = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ',
                'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];
  return dirs[Math.round(deg / 22.5) % 16];
}