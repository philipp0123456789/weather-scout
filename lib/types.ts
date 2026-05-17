export type UserProfile = {
  id: string;
  person_name: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  morning_time: string;
  warmth_offset: number;
  wind_sensitive: boolean;
  rain_sensitive: boolean;
  prefers_skirt: boolean;
};

export type WeatherSummary = {
  date: string;
  minTemp: number;
  maxTemp: number;
  morningTemp: number;
  morningFeels: number;
  afternoonTemp: number;
  precipProbMax: number;
  windMax: number;
  uvMax: number;
  weatherText: string;
  tempRange: number;
};

export type Recommendation = {
  score: number;
  effectiveTemp: number;
  headline: string;
  outfit: string;
  notes: string[];
  skirtAdvice: string;
  message: string;
};
