export type CurrentWeather = {
  time: string;
  interval?: number;
  temperature_2m?: number;
  temperature?: number; // legacy fallback
  relative_humidity_2m?: number;
  apparent_temperature?: number;
  is_day: number;
  precipitation?: number;
  weather_code?: number;
  weathercode?: number; // legacy fallback
  surface_pressure?: number;
  wind_speed_10m?: number;
  windspeed?: number; // legacy fallback
  wind_direction_10m?: number;
  winddirection?: number; // legacy fallback
  uv_index?: number;
};

export type CurrentWeatherUnits = {
  time: string;
  interval?: string;
  temperature_2m?: string;
  temperature?: string;
  relative_humidity_2m?: string;
  apparent_temperature?: string;
  is_day?: string;
  precipitation?: string;
  weather_code?: string;
  weathercode?: string;
  surface_pressure?: string;
  wind_speed_10m?: string;
  windspeed?: string;
  wind_direction_10m?: string;
  winddirection?: string;
  uv_index?: string;
};

export type HourlyWeather = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m?: number[];
  apparent_temperature?: number[];
  precipitation_probability?: number[];
  weather_code: number[];
  wind_speed_10m?: number[];
};

export type HourlyWeatherUnits = {
  time: string;
  temperature_2m: string;
  relative_humidity_2m?: string;
  apparent_temperature?: string;
  precipitation_probability?: string;
  weather_code: string;
  wind_speed_10m?: string;
};

export type DailyWeather = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  sunrise?: string[];
  sunset?: string[];
  uv_index_max?: number[];
  precipitation_probability_max?: number[];
};

export type DailyWeatherUnits = {
  time: string;
  weather_code: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  uv_index_max?: string;
  precipitation_probability_max?: string;
};

export type WeatherDataAPIResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather?: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    is_day: number;
    weathercode: number;
  };
  current_weather_units?: {
    temperature: string;
    windspeed: string;
    winddirection: string;
  };
  current?: CurrentWeather;
  current_units?: CurrentWeatherUnits;
  hourly?: HourlyWeather;
  hourly_units?: HourlyWeatherUnits;
  daily?: DailyWeather;
  daily_units?: DailyWeatherUnits;
};

export type TempUnit = 'celsius' | 'fahrenheit';