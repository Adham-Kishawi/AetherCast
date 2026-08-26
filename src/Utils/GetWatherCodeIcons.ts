import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const getWeatherCodeIcon = (code: number, isDay: number = 1): LucideIcon => {
  const isNight = isDay === 0;

  switch (code) {
    case 0:
      return isNight ? Moon : Sun;
    case 1:
      return isNight ? CloudMoon : Sun;
    case 2:
      return isNight ? CloudMoon : CloudSun;
    case 3:
      return Cloud;
    case 45:
    case 48:
      return CloudFog;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return CloudDrizzle;
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return CloudRain;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return CloudSnow;
    case 95:
    case 96:
    case 99:
      return CloudLightning;
    default:
      return isNight ? CloudMoon : CloudSun;
  }
};

export type WeatherTheme = {
  cardBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  emoji: string;
};

export const getWeatherTheme = (code: number, isDay: number = 1): WeatherTheme => {
  const isNight = isDay === 0;

  if (isNight && (code === 0 || code === 1 || code === 2)) {
    return {
      cardBg: 'bg-indigo-50/80 border-indigo-900/30 dark:bg-[#141426] dark:border-indigo-500/50',
      badgeBg: 'bg-indigo-200 dark:bg-indigo-300',
      badgeBorder: 'border-indigo-900 dark:border-indigo-200',
      badgeText: 'text-indigo-950 dark:text-zinc-950',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      emoji: '🌙',
    };
  }

  // Clear / Sunny
  if (code === 0 || code === 1) {
    return {
      cardBg: 'bg-amber-50/90 border-amber-900/30 dark:bg-[#1B1710] dark:border-amber-500/50',
      badgeBg: 'bg-amber-300 dark:bg-amber-400',
      badgeBorder: 'border-amber-900 dark:border-amber-300',
      badgeText: 'text-amber-950 dark:text-zinc-950',
      accentColor: 'text-amber-600 dark:text-amber-400',
      emoji: '☀️',
    };
  }

  // Cloudy / Partly Cloudy
  if (code === 2 || code === 3) {
    return {
      cardBg: 'bg-stone-50 border-stone-900/30 dark:bg-[#181920] dark:border-zinc-600',
      badgeBg: 'bg-stone-200 dark:bg-zinc-200',
      badgeBorder: 'border-stone-900 dark:border-zinc-300',
      badgeText: 'text-stone-900 dark:text-zinc-950',
      accentColor: 'text-sky-600 dark:text-sky-400',
      emoji: '⛅',
    };
  }

  // Fog
  if (code === 45 || code === 48) {
    return {
      cardBg: 'bg-teal-50/80 border-teal-900/30 dark:bg-[#101A1A] dark:border-teal-500/50',
      badgeBg: 'bg-teal-200 dark:bg-teal-300',
      badgeBorder: 'border-teal-900 dark:border-teal-200',
      badgeText: 'text-teal-950 dark:text-zinc-950',
      accentColor: 'text-teal-600 dark:text-teal-400',
      emoji: '🌫️',
    };
  }

  // Drizzle / Rain
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      cardBg: 'bg-sky-50/90 border-sky-900/30 dark:bg-[#111A28] dark:border-sky-500/50',
      badgeBg: 'bg-sky-200 dark:bg-sky-300',
      badgeBorder: 'border-sky-900 dark:border-sky-200',
      badgeText: 'text-sky-950 dark:text-zinc-950',
      accentColor: 'text-blue-600 dark:text-blue-400',
      emoji: '🌧️',
    };
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      cardBg: 'bg-cyan-50/80 border-cyan-900/30 dark:bg-[#101D26] dark:border-cyan-500/50',
      badgeBg: 'bg-cyan-200 dark:bg-cyan-300',
      badgeBorder: 'border-cyan-900 dark:border-cyan-200',
      badgeText: 'text-cyan-950 dark:text-zinc-950',
      accentColor: 'text-cyan-600 dark:text-cyan-400',
      emoji: '❄️',
    };
  }

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return {
      cardBg: 'bg-purple-50/90 border-purple-900/30 dark:bg-[#1E142B] dark:border-purple-500/50',
      badgeBg: 'bg-purple-300 dark:bg-purple-300',
      badgeBorder: 'border-purple-900 dark:border-purple-200',
      badgeText: 'text-purple-950 dark:text-zinc-950',
      accentColor: 'text-purple-600 dark:text-purple-400',
      emoji: '⚡',
    };
  }

  // Fallback
  return {
    cardBg: 'bg-stone-50 border-stone-900/30 dark:bg-[#181920] dark:border-zinc-600',
    badgeBg: 'bg-stone-200 dark:bg-zinc-200',
    badgeBorder: 'border-stone-900 dark:border-zinc-300',
    badgeText: 'text-stone-900 dark:text-zinc-950',
    accentColor: 'text-stone-700 dark:text-zinc-300',
    emoji: '🌤️',
  };
};
