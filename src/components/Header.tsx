import { CloudSun, Compass, Moon, Sun, Loader2 } from 'lucide-react';
import type { TempUnit } from '../types/WeatherData';

type Props = {
  unit: TempUnit;
  onToggleUnit: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onLocateUser: () => void;
  isLocating?: boolean;
  cityCount: number;
};

export default function Header({
  unit,
  onToggleUnit,
  isDark,
  onToggleDark,
  onLocateUser,
  isLocating = false,
  cityCount,
}: Props) {
  return (
    <header className="mb-8">
      {/* Top Notice Bar / Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-zinc-900/15 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">LIVE RADAR ACTIVE</span>
          <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">•</span>
          <span className="hidden sm:inline">AUTOSYNC 15S</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-400 text-amber-950 dark:text-zinc-950 border border-amber-900 dark:border-amber-300 text-[11px] font-black">
            {cityCount} {cityCount === 1 ? 'LOCATION' : 'LOCATIONS'} PINNED
          </span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          {/* Logo Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-amber-300 dark:bg-amber-400 border-[2.5px] border-zinc-900 dark:border-zinc-200 shadow-[3px_3px_0px_#18181b] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-center text-zinc-900">
            <CloudSun size={34} strokeWidth={2.5} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-heading">
                AetherCast
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-sky-200 dark:bg-sky-400 text-sky-950 dark:text-zinc-950 border-2 border-zinc-900 dark:border-zinc-200 shadow-[1.5px_1.5px_0px_#18181b] dark:shadow-[1.5px_1.5px_0px_#000000]">
                Live
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
              Soft Neo-Brutalist live meteorological dashboard & forecast
            </p>
          </div>
        </div>

        {/* Control Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={onLocateUser}
            disabled={isLocating}
            className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-200 dark:bg-emerald-400 text-emerald-950 dark:text-zinc-950 font-bold text-xs sm:text-sm disabled:opacity-50"
            title="Detect My Location"
          >
            {isLocating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Compass size={16} strokeWidth={2.5} />
            )}
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Unit Switcher */}
          <button
            type="button"
            onClick={onToggleUnit}
            className="neo-btn flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181922] text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm border-2 border-zinc-900 dark:border-zinc-600"
            title="Switch Celsius / Fahrenheit"
          >
            <span className={unit === 'celsius' ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'}>
              °C
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className={unit === 'fahrenheit' ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'}>
              °F
            </span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-amber-300 dark:bg-amber-400 dark:text-zinc-950 font-bold text-xs sm:text-sm border-2 border-zinc-900 dark:border-amber-300"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun size={17} strokeWidth={2.5} />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={17} strokeWidth={2.5} />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}