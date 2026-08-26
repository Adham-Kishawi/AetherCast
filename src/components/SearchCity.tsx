import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, X, Check, Flame } from 'lucide-react';
import type { CityData, CityDataAPIResponse } from '../types/CityData';

type Props = {
  handleCitySelect: (city: CityData) => void;
  existingCityIds: number[];
};

const POPULAR_CITIES = [
  { name: 'Cairo', country: 'Egypt', lat: 30.0626, lon: 31.2497 },
  { name: 'London', country: 'United Kingdom', lat: 51.5085, lon: -0.1257 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
  { name: 'New York', country: 'United States', lat: 40.7143, lon: -74.006 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.0772, lon: 55.3093 },
  { name: 'Paris', country: 'France', lat: 48.8534, lon: 2.3488 },
];

export default function SearchCity({ handleCitySelect, existingCityIds }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      setIsOpen(false);
    }
  };

  // Debounced API search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data: CityDataAPIResponse = await response.json();
        setResults(data.results ?? []);
        setIsOpen(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('City search error:', err);
        setErrorMessage('Unable to find cities right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (city: CityData) => {
    handleCitySelect({
      ...city,
      updated_at: new Date().toISOString(),
    });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleQuickAdd = async (cityItem: typeof POPULAR_CITIES[0]) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityItem.name)}&count=1&language=en&format=json`
      );
      const data: CityDataAPIResponse = await res.json();
      if (data.results && data.results.length > 0) {
        handleSelect(data.results[0]);
      } else {
        handleSelect({
          id: Math.floor(cityItem.lat * 1000 + cityItem.lon * 1000),
          name: cityItem.name,
          country: cityItem.country,
          latitude: cityItem.lat,
          longitude: cityItem.lon,
          elevation: 10,
          feature_code: 'PPLA',
          country_code: '',
          admin1_id: 0,
          timezone: 'auto',
          country_id: 0,
          admin1: '',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Quick add error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative z-30 mb-8 max-w-3xl mx-auto">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 dark:text-zinc-400">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-amber-500" />
          ) : (
            <Search size={20} strokeWidth={2.5} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search for any city (e.g. Cairo, Tokyo, London, Paris)..."
          className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white dark:bg-[#15161E] border-[2.5px] border-zinc-900 dark:border-zinc-600 rounded-2xl shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#000000] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Popular Quick-Select Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mr-1">
          <Flame size={14} className="text-amber-500" />
          <span>Popular:</span>
        </div>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleQuickAdd(city)}
            className="neo-btn px-3 py-1 rounded-lg bg-zinc-100 dark:bg-[#1C1D26] hover:bg-amber-200 dark:hover:bg-amber-400 hover:text-zinc-950 dark:hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs font-bold border-2 border-zinc-900 dark:border-zinc-600 shadow-[2px_2px_0px_#18181b] dark:shadow-[2px_2px_0px_#000000]"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Floating Results Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#15161E] border-[2.5px] border-zinc-900 dark:border-zinc-600 rounded-2xl shadow-[6px_6px_0px_#18181b] dark:shadow-[6px_6px_0px_#000000] max-h-80 overflow-y-auto z-50 p-2 custom-scrollbar">
          {errorMessage && (
            <div className="p-4 text-center text-sm font-bold text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim().length >= 2 && !errorMessage && (
            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">
              <p className="font-bold text-base">No locations found</p>
              <p className="text-xs mt-1">Try checking the spelling or search another city.</p>
            </div>
          )}

          {results.map((city) => {
            const isAlreadyAdded = existingCityIds.includes(city.id);
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 hover:bg-amber-50 dark:hover:bg-[#20222D] transition-colors border border-transparent hover:border-zinc-900/10 dark:hover:border-zinc-700 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-[#282A38] text-amber-800 dark:text-amber-300 border border-zinc-900/20 dark:border-zinc-600 group-hover:scale-110 transition-transform">
                    <MapPin size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                      {city.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                {isAlreadyAdded ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-600/40">
                    <Check size={14} strokeWidth={3} />
                    Added
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    + Add City
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
