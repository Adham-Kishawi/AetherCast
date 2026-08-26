import { useEffect, useState, createElement, useCallback } from 'react';
import {
  X,
  Wind,
  Droplets,
  Thermometer,
  SunMedium,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import type { CityData } from '../types/CityData';
import type { WeatherDataAPIResponse, TempUnit } from '../types/WeatherData';
import { getWeatherCodeDescription } from '../Utils/GetWatherCodeDescription';
import { getWeatherCodeIcon, getWeatherTheme } from '../Utils/GetWatherCodeIcons';
import { getWeatherInsight } from '../Utils/WeatherInsights';

type Props = {
  city: CityData;
  unit: TempUnit;
  handleCityRemove: (cityId: number) => void;
};

export default function WeatherCard({ city, unit, handleCityRemove }: Props) {
  const [weatherData, setWeatherData] = useState<WeatherDataAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(
    typeof city.updated_at === 'string' ? new Date(city.updated_at) : (city.updated_at || new Date())
  );

  const fetchWeather = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      setHasError(false);
      const tempParam = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=6${tempParam}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather API request failed');

      const data: WeatherDataAPIResponse = await response.json();
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Failed to fetch weather for ${city.name}:`, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [city.latitude, city.longitude, city.name, unit]);

  useEffect(() => {
    let ignore = false;

    const initialFetch = async () => {
      try {
        const tempParam = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=6${tempParam}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API request failed');
        const data: WeatherDataAPIResponse = await response.json();
        if (!ignore) {
          setWeatherData(data);
          setLastUpdated(new Date());
          setIsLoading(false);
          setHasError(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error(`Failed to fetch weather for ${city.name}:`, error);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initialFetch();

    const interval = setInterval(() => {
      fetchWeather(false);
    }, 15000); // 15s auto-refresh

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [city.latitude, city.longitude, city.name, unit, fetchWeather]);

  // Extract metrics safely
  const current = weatherData?.current;
  const legacy = weatherData?.current_weather;

  const temp = Math.round(
    current?.temperature_2m ?? legacy?.temperature ?? 0
  );
  const feelsLike = Math.round(current?.apparent_temperature ?? temp);
  const weatherCode = current?.weather_code ?? legacy?.weathercode ?? 0;
  const isDay = current?.is_day ?? legacy?.is_day ?? 1;
  const windSpeed = Math.round(current?.wind_speed_10m ?? legacy?.windspeed ?? 0);
  const humidity = current?.relative_humidity_2m ?? 50;
  const uvIndex = current?.uv_index ?? 0;
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  // Derived styling & insights
  const theme = getWeatherTheme(weatherCode, isDay);
  const description = getWeatherCodeDescription(weatherCode);
  const insight = getWeatherInsight(temp, weatherCode, windSpeed, humidity, uvIndex);

  // Hourly 24h slice from API
  const getNext24Hours = () => {
    if (!weatherData?.hourly) return [];
    const times = weatherData.hourly.time || [];
    const temps = weatherData.hourly.temperature_2m || [];
    const codes = weatherData.hourly.weather_code || [];
    const precip = weatherData.hourly.precipitation_probability || [];

    const nowIso = new Date().toISOString().slice(0, 13);
    let startIndex = times.findIndex((t) => t.startsWith(nowIso));
    if (startIndex === -1) startIndex = 0;

    return times.slice(startIndex, startIndex + 24).map((timeStr, idx) => {
      const actualIdx = startIndex + idx;
      const hourDate = new Date(timeStr);
      const hourDisplay = idx === 0 ? 'Now' : hourDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const hourIsDay = hourDate.getHours() >= 6 && hourDate.getHours() < 19 ? 1 : 0;
      return {
        time: hourDisplay,
        temp: Math.round(temps[actualIdx] ?? 0),
        code: codes[actualIdx] ?? 0,
        precip: precip[actualIdx] ?? 0,
        isDay: hourIsDay,
      };
    });
  };

  // 5-Day forecast
  const getFiveDayForecast = () => {
    if (!weatherData?.daily) return [];
    const days = weatherData.daily.time || [];
    const maxTemps = weatherData.daily.temperature_2m_max || [];
    const minTemps = weatherData.daily.temperature_2m_min || [];
    const codes = weatherData.daily.weather_code || [];

    return days.slice(0, 5).map((dateStr, idx) => {
      const d = new Date(dateStr);
      const dayName =
        idx === 0
          ? 'Today'
          : d.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        maxTemp: Math.round(maxTemps[idx] ?? 0),
        minTemp: Math.round(minTemps[idx] ?? 0),
        code: codes[idx] ?? 0,
      };
    });
  };

  const next24Hours = getNext24Hours();
  const fiveDayForecast = getFiveDayForecast();

  // Loading skeleton card
  if (isLoading) {
    return (
      <div className="relative p-6 rounded-2xl bg-white dark:bg-[#15161E] border-[2.5px] border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#000000] animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
          </div>
          <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
        <div className="h-14 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl my-4"></div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error Card
  if (hasError && !weatherData) {
    return (
      <div className="relative p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border-[2.5px] border-red-900 dark:border-red-500 shadow-[4px_4px_0px_#7f1d1d] dark:shadow-[4px_4px_0px_#000000] text-zinc-900 dark:text-zinc-100">
        <button
          type="button"
          onClick={() => handleCityRemove(city.id)}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-zinc-800 border-2 border-red-900 text-zinc-700 hover:bg-red-200 transition-colors cursor-pointer"
          aria-label="Remove city"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
          <AlertCircle size={20} />
          <h3>{city.name}</h3>
        </div>
        <p className="text-xs text-red-600 dark:text-red-300 font-medium mb-4">
          Failed to fetch current weather data.
        </p>
        <button
          type="button"
          onClick={() => fetchWeather(true)}
          className="neo-btn px-3 py-1.5 rounded-lg bg-red-200 dark:bg-red-900 text-red-950 dark:text-red-100 text-xs font-bold"
        >
          Retry Fetching
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border-[2.5px] shadow-[5px_5px_0px_#18181b] dark:shadow-[5px_5px_0px_#000000] transition-all duration-200 ${theme.cardBg}`}
    >
      {/* Top Header Row: City Name & Action Buttons */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading truncate">
              {city.name}
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white/90 dark:bg-[#252633] border border-zinc-900/40 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200">
              {city.country_code || city.country}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5 truncate">
            {city.admin1 ? `${city.admin1}, ` : ''}Lat: {city.latitude.toFixed(2)}°
          </p>
        </div>

        {/* Top-right card actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchWeather(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1E202B] border-2 border-zinc-900 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-amber-100 dark:hover:bg-amber-400 dark:hover:text-zinc-950 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Manual sync"
            aria-label="Refresh weather"
          >
            <RefreshCw
              size={15}
              strokeWidth={2.5}
              className={isRefreshing ? 'animate-spin text-amber-600' : ''}
            />
          </button>

          <button
            type="button"
            onClick={() => handleCityRemove(city.id)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1E202B] border-2 border-zinc-900 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Remove city"
            aria-label="Remove city"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Temperature & Weather Condition Display */}
      <div className="my-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-zinc-50 font-heading tracking-tight">
              {temp}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-700 dark:text-zinc-300 font-heading">
              {unitSymbol}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-base">{theme.emoji}</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {description}
            </span>
          </div>
        </div>

        {/* Large Atmospheric Icon Badge */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl ${theme.badgeBg} border-[2.5px] ${theme.badgeBorder} shadow-[3px_3px_0px_#18181b] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0`}
        >
          {createElement(getWeatherCodeIcon(weatherCode, isDay), {
            size: 38,
            strokeWidth: 2.5,
            className: theme.badgeText,
          })}
        </div>
      </div>

      {/* Smart Contextual Weather Insight / Tip */}
      <div className="my-2">
        <div
          className={`px-3 py-2 rounded-xl border-2 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#18181b] dark:shadow-[2px_2px_0px_#000000] ${insight.badgeClass}`}
        >
          <span className="text-base shrink-0">{insight.emoji}</span>
          <span className="truncate">{insight.text}</span>
        </div>
      </div>

      {/* 4-Column Weather Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 text-xs font-bold">
        {/* Feels Like */}
        <div className="p-2 rounded-xl bg-white/95 dark:bg-[#1C1D26] border-2 border-zinc-900/30 dark:border-zinc-700 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]">
          <Thermometer size={16} className="text-amber-500 shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Feels</p>
            <p className="text-zinc-900 dark:text-zinc-100 truncate">{feelsLike}{unitSymbol}</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-2 rounded-xl bg-white/95 dark:bg-[#1C1D26] border-2 border-zinc-900/30 dark:border-zinc-700 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]">
          <Droplets size={16} className="text-sky-500 shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Humidity</p>
            <p className="text-zinc-900 dark:text-zinc-100 truncate">{humidity}%</p>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-2 rounded-xl bg-white/95 dark:bg-[#1C1D26] border-2 border-zinc-900/30 dark:border-zinc-700 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]">
          <Wind size={16} className="text-teal-500 shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Wind</p>
            <p className="text-zinc-900 dark:text-zinc-100 truncate">{windSpeed} km/h</p>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-2 rounded-xl bg-white/95 dark:bg-[#1C1D26] border-2 border-zinc-900/30 dark:border-zinc-700 flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]">
          <SunMedium size={16} className="text-orange-500 shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">UV Index</p>
            <p className="text-zinc-900 dark:text-zinc-100 truncate">{uvIndex.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Expandable Forecast Section Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="neo-btn mt-3 w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1E202B] text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-center gap-2 border-2 border-zinc-900 dark:border-zinc-600 shadow-[2px_2px_0px_#18181b] dark:shadow-[2px_2px_0px_#000000] cursor-pointer"
      >
        <span>{isExpanded ? 'Hide Forecast' : '24h & 5-Day Forecast'}</span>
        {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
      </button>

      {/* Smooth Expanded Drawer: 24h Hourly Scroller & 5-Day Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-zinc-900/20 dark:border-zinc-700 space-y-4">
          {/* 24-Hour Scroller */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-extrabold uppercase text-zinc-800 dark:text-zinc-200">
              <Clock size={14} />
              <span>Hourly Forecast (24 Hours)</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {next24Hours.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-between p-2 rounded-xl bg-white/95 dark:bg-[#1E202B] border-2 border-zinc-900/30 dark:border-zinc-700 min-w-[64px] shrink-0 text-center shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]"
                >
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    {h.time}
                  </span>
                  <div className="my-1 text-amber-500 dark:text-amber-400 flex justify-center">
                    {createElement(getWeatherCodeIcon(h.code, h.isDay), {
                      size: 18,
                      strokeWidth: 2.5,
                    })}
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 font-heading">
                    {h.temp}°
                  </span>
                  {h.precip > 0 && (
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                      {h.precip}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Mini Forecast */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-extrabold uppercase text-zinc-800 dark:text-zinc-200">
              <Compass size={14} />
              <span>5-Day Outlook</span>
            </div>

            <div className="space-y-1.5">
              {fiveDayForecast.map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/90 dark:bg-[#1E202B] border border-zinc-900/20 dark:border-zinc-700 text-xs font-bold"
                >
                  <div className="flex items-center gap-2 w-24">
                    <span className="text-zinc-900 dark:text-zinc-100">{day.day}</span>
                    <span className="text-[10px] text-zinc-400">{day.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    {createElement(getWeatherCodeIcon(day.code, 1), {
                      size: 16,
                      strokeWidth: 2.5,
                      className: 'text-amber-500',
                    })}
                    <span className="text-[11px] font-medium hidden sm:inline">
                      {getWeatherCodeDescription(day.code)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-zinc-900 dark:text-zinc-100 font-extrabold font-heading">
                      {day.maxTemp}°
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                      / {day.minTemp}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="mt-3 pt-2.5 border-t border-zinc-900/10 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
        <span>Synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <span className="flex items-center gap-1 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Auto-15s
        </span>
      </div>
    </div>
  );
}
