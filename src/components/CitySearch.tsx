'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { searchCities, type CityResult } from '@/lib/api/weather';

interface CitySearchProps {
  onSelect: (city: CityResult) => void;
}

/* Быстрый доступ — областные центры РБ */
const POPULAR_CITIES: CityResult[] = [
  { id: 1, name: 'Минск',     latitude: 53.9,    longitude: 27.5667, country: 'Беларусь', admin1: 'Минская область',     timezone: 'Europe/Minsk' },
  { id: 2, name: 'Гомель',    latitude: 52.4345, longitude: 30.9754, country: 'Беларусь', admin1: 'Гомельская область',  timezone: 'Europe/Minsk' },
  { id: 3, name: 'Могилёв',   latitude: 53.9168, longitude: 30.3449, country: 'Беларусь', admin1: 'Могилёвская область', timezone: 'Europe/Minsk' },
  { id: 4, name: 'Витебск',   latitude: 55.1904, longitude: 30.2049, country: 'Беларусь', admin1: 'Витебская область',   timezone: 'Europe/Minsk' },
  { id: 5, name: 'Гродно',    latitude: 53.6779, longitude: 23.8295, country: 'Беларусь', admin1: 'Гродненская область', timezone: 'Europe/Minsk' },
  { id: 6, name: 'Брест',     latitude: 52.0976, longitude: 23.7341, country: 'Беларусь', admin1: 'Брестская область',   timezone: 'Europe/Minsk' },
];

interface SearchState {
  results: CityResult[];
  isLoading: boolean;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({ results: [], isLoading: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Закрытие дропдауна по клику вне */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Функция поиска, вызывается через callback
  const performSearch = useCallback(async (q: string) => {
    setSearchState({ results: [], isLoading: true });
    const cities = await searchCities(q);
    setSearchState({ results: cities, isLoading: false });
    setIsOpen(true);
  }, []);

  /* Поиск с debounce 300 мс */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      debounceRef.current = null;
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(q);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const handleSelect = (city: CityResult) => {
    setQuery(city.name);
    setIsOpen(false);
    onSelect(city);
  };

  const showPopular = query.trim().length < 2;

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      {/* Поле ввода */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Город в Беларуси…"
          className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border rounded-2xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue transition"
        />
      </div>

      {/* Дропдаун */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-full bg-bg-card border border-border rounded-2xl shadow-lg max-h-80 overflow-y-auto">
          {showPopular ? (
            <div className="p-2">
              <p className="px-3 py-1 text-xs font-medium text-text-muted uppercase tracking-wide">
                Популярные города
              </p>
              {POPULAR_CITIES.map((city) => (
                <CityRow key={city.id} city={city} onClick={() => handleSelect(city)} />
              ))}
            </div>
          ) : searchState.isLoading ? (
            <div className="p-4 text-center text-sm text-text-muted">Поиск…</div>
          ) : searchState.results.length > 0 ? (
            <div className="p-2">
              {searchState.results.map((city) => (
                <CityRow key={city.id} city={city} onClick={() => handleSelect(city)} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-text-muted">Город не найден</div>
          )}
        </div>
      )}
    </div>
  );
}

/* Строка города в дропдауне */
function CityRow({ city, onClick }: { city: CityResult; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-xl hover:bg-bg-card-hover text-text-primary transition"
    >
      <span className="font-medium">{city.name}</span>
      <span className="text-sm text-text-secondary ml-2">{city.admin1}</span>
    </button>
  );
}
