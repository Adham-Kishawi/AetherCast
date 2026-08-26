export type WeatherInsight = {
  text: string;
  emoji: string;
  badgeClass: string;
};

export const getWeatherInsight = (
  temp: number,
  weatherCode: number,
  windSpeed: number = 0,
  humidity: number = 50,
  uvIndex: number = 0
): WeatherInsight => {
  // Severe weather checks first
  if ([95, 96, 99].includes(weatherCode)) {
    return {
      text: 'Thunderstorm alert • Stay indoors',
      emoji: '⚡',
      badgeClass: 'bg-purple-200 text-purple-950 border-purple-900 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-500',
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return {
      text: 'Snowfall active • Slippery roads',
      emoji: '❄️',
      badgeClass: 'bg-cyan-200 text-cyan-950 border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-500',
    };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return {
      text: 'Rainy conditions • Bring an umbrella',
      emoji: '🌧️',
      badgeClass: 'bg-sky-200 text-sky-950 border-sky-900 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-500',
    };
  }

  // UV Alert
  if (uvIndex >= 7) {
    return {
      text: 'Very High UV • Apply sunscreen SPF 50',
      emoji: '🧴',
      badgeClass: 'bg-orange-200 text-orange-950 border-orange-900 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-500',
    };
  }

  // Wind Alert
  if (windSpeed > 35) {
    return {
      text: 'High winds • Hold onto your hat',
      emoji: '💨',
      badgeClass: 'bg-teal-200 text-teal-950 border-teal-900 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-500',
    };
  }

  // Temperature ranges
  if (temp <= 5) {
    return {
      text: 'Freezing cold • Heavy coat recommended',
      emoji: '🧣',
      badgeClass: 'bg-blue-200 text-blue-950 border-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-500',
    };
  }

  if (temp <= 14) {
    return {
      text: 'Chilly breeze • Layer up nicely',
      emoji: '🧥',
      badgeClass: 'bg-indigo-200 text-indigo-950 border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-500',
    };
  }

  if (temp >= 33) {
    return {
      text: 'Extreme heat • Stay hydrated & cool',
      emoji: '🥤',
      badgeClass: 'bg-rose-200 text-rose-950 border-rose-900 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-500',
    };
  }

  if (temp >= 26) {
    return {
      text: 'Warm & sunny • Great for outdoors',
      emoji: '🕶️',
      badgeClass: 'bg-amber-200 text-amber-950 border-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-500',
    };
  }

  if (humidity > 80) {
    return {
      text: 'High humidity • Air feels muggy',
      emoji: '💧',
      badgeClass: 'bg-emerald-200 text-emerald-950 border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-500',
    };
  }

  // Pleasant weather
  return {
    text: 'Pleasant weather • Enjoy your day',
    emoji: '🌤️',
    badgeClass: 'bg-lime-200 text-lime-950 border-lime-900 dark:bg-lime-950 dark:text-lime-200 dark:border-lime-500',
  };
};
