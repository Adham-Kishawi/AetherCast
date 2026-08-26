import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchCity from './components/SearchCity';
import WeatherCard from './components/WeatherCard';
import type { CityData } from './types/CityData';
import type { TempUnit } from './types/WeatherData';
import { PlusCircle, CheckCircle2, MapPin } from 'lucide-react';

const STORAGE_KEY_CITIES = 'aethercast_cities_v2';
const STORAGE_KEY_UNIT = 'aethercast_unit';
const STORAGE_KEY_THEME = 'aethercast_theme';

const DEFAULT_INITIAL_CITIES: CityData[] = [
  {
    id: 360630,
    name: 'Cairo',
    latitude: 30.0626,
    longitude: 31.2497,
    elevation: 23,
    country_code: 'EG',
    country: 'Egypt',
    admin1: 'Cairo',
    updated_at: new Date().toISOString(),
  },
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    elevation: 40,
    country_code: 'JP',
    country: 'Japan',
    admin1: 'Tokyo',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    elevation: 25,
    country_code: 'GB',
    country: 'United Kingdom',
    admin1: 'England',
    updated_at: new Date().toISOString(),
  },
];

export default function App() {
  // Cities state with localStorage persistence
  const [cities, setCities] = useState<CityData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CITIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved cities from localStorage:', e);
    }
    return DEFAULT_INITIAL_CITIES;
  });

  // Temperature unit state (°C / °F)
  const [unit, setUnit] = useState<TempUnit>(() => {
    try {
      const savedUnit = localStorage.getItem(STORAGE_KEY_UNIT);
      if (savedUnit === 'celsius' || savedUnit === 'fahrenheit') return savedUnit;
    } catch {
      // fallback
    }
    return 'celsius';
  });

  // Theme state (Light / Dark)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme !== null) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark class on <html> & body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-[#0B0C10]', 'text-zinc-100');
      document.body.classList.remove('bg-[#FAF7F0]', 'text-zinc-900');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-[#0B0C10]', 'text-zinc-100');
      document.body.classList.add('bg-[#FAF7F0]', 'text-zinc-900');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  // Persist cities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CITIES, JSON.stringify(cities));
    } catch (e) {
      console.error('Error saving cities to localStorage:', e);
    }
  }, [cities]);

  // Persist unit
  const handleToggleUnit = () => {
    const nextUnit: TempUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(nextUnit);
    localStorage.setItem(STORAGE_KEY_UNIT, nextUnit);
    showToast(`Switched units to °${nextUnit === 'celsius' ? 'C' : 'F'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCitySelect = (city: CityData) => {
    setCities((prevCities) => {
      if (prevCities.some((c) => c.id === city.id || (c.name.toLowerCase() === city.name.toLowerCase() && c.country === city.country))) {
        showToast(`"${city.name}" is already on your dashboard`);
        return prevCities;
      }
      showToast(`Added "${city.name}" to dashboard`);
      return [city, ...prevCities];
    });
  };

  const handleCityRemove = (cityId: number) => {
    setCities((prevCities) => {
      const target = prevCities.find((c) => c.id === cityId);
      if (target) showToast(`Removed "${target.name}"`);
      return prevCities.filter((city) => city.id !== cityId);
    });
  };

  const handleResetDefaults = () => {
    setCities(DEFAULT_INITIAL_CITIES);
    showToast('Restored default cities');
  };

  // GPS User Location Detection
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(2)},${longitude.toFixed(2)}&count=1`
          );
          let cityName = 'Current Location';
          let countryName = 'Local';
          let id = Math.floor(latitude * 10000 + longitude * 10000);

          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              cityName = data.results[0].name;
              countryName = data.results[0].country;
              id = data.results[0].id;
            }
          }

          const myCity: CityData = {
            id,
            name: cityName,
            country: countryName,
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          };

          handleCitySelect(myCity);
        } catch (err) {
          console.error('Locate error:', err);
          handleCitySelect({
            id: Math.floor(latitude * 1000 + longitude * 1000),
            name: `My Location (${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°)`,
            country: 'GPS',
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        showToast('Permission denied or location unavailable.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        {/* Header */}
        <Header
          unit={unit}
          onToggleUnit={handleToggleUnit}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onLocateUser={handleLocateUser}
          isLocating={isLocating}
          cityCount={cities.length}
        />

        {/* Search & Suggestions */}
        <SearchCity
          handleCitySelect={handleCitySelect}
          existingCityIds={cities.map((c) => c.id)}
        />

        {/* Dashboard Grid */}
        {cities.length > 0 ? (
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-6">
            {cities.map((city) => (
              <WeatherCard
                key={city.id}
                city={city}
                unit={unit}
                handleCityRemove={handleCityRemove}
              />
            ))}
          </main>
        ) : (
          /* Empty State */
          <div className="my-12 p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#15161E] border-[2.5px] border-zinc-900 dark:border-zinc-700 shadow-[6px_6px_0px_#18181b] dark:shadow-[6px_6px_0px_#000000] max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-200 dark:bg-amber-400 text-amber-950 dark:text-zinc-950 border-2 border-zinc-900 flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-heading">
              No Cities Added Yet
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
              Search for your favorite cities above or restore the recommended starter dashboard.
            </p>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="neo-btn mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold text-sm"
            >
              <PlusCircle size={18} strokeWidth={2.5} />
              Restore Starter Locations
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-amber-300 dark:text-zinc-950 border-2 border-zinc-900 font-bold text-xs sm:text-sm shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#000000] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-zinc-950" strokeWidth={2.5} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
