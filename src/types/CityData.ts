export type CityDataAPIResponse = {
  results?: CityData[];
  generationtime_ms?: number;
};

export type CityData = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1_id?: number;
  timezone?: string;
  country_id?: number;
  country: string;
  admin1?: string;
  updated_at: string | Date;
};