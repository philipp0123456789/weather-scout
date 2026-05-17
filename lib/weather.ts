import type { UserProfile, WeatherSummary } from "./types";

const WEATHER_CODE: Record<number, string> = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "cloudy",
  45: "foggy",
  48: "freezing fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  95: "thunderstorm"
};

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function todayInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

function hourFromTime(value: string) {
  const parsed = Number(value.split(":")[0]);
  return Number.isFinite(parsed) ? parsed : 7;
}

export async function fetchWeather(profile: UserProfile): Promise<WeatherSummary> {
  const params = new URLSearchParams({
    latitude: String(profile.latitude),
    longitude: String(profile.longitude),
    timezone: profile.timezone || "auto",
    forecast_days: "1",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max",
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = await response.json();
  const date = todayInTimezone(profile.timezone);
  const morningHour = hourFromTime(profile.morning_time);
  const targetPrefix = `${date}T${String(morningHour).padStart(2, "0")}:00`;

  const times: string[] = data.hourly?.time ?? [];
  const exactIndex = times.findIndex((time) => time === targetPrefix);
  const firstTodayIndex = times.findIndex((time) => time.startsWith(date));
  const morningIndex = exactIndex >= 0 ? exactIndex : firstTodayIndex;

  const todayIndexes = times
    .map((time, index) => ({ time, index }))
    .filter((item) => item.time.startsWith(date));

  const temps = todayIndexes.map((item) => Number(data.hourly.temperature_2m[item.index]));
  const afternoonTemps = todayIndexes
    .filter((item) => {
      const hour = Number(item.time.slice(11, 13));
      return hour >= 12 && hour <= 18;
    })
    .map((item) => Number(data.hourly.temperature_2m[item.index]));

  const minTemp = Number(data.daily.temperature_2m_min[0]);
  const maxTemp = Number(data.daily.temperature_2m_max[0]);
  const morningTemp = morningIndex >= 0 ? Number(data.hourly.temperature_2m[morningIndex]) : minTemp;
  const morningFeels = morningIndex >= 0 ? Number(data.hourly.apparent_temperature[morningIndex]) : morningTemp;

  return {
    date,
    minTemp: round(minTemp, 1),
    maxTemp: round(maxTemp, 1),
    morningTemp: round(morningTemp, 1),
    morningFeels: round(morningFeels, 1),
    afternoonTemp: round(afternoonTemps.length ? Math.max(...afternoonTemps) : maxTemp, 1),
    precipProbMax: round(Number(data.daily.precipitation_probability_max?.[0] ?? 0)),
    windMax: round(Number(data.daily.wind_speed_10m_max?.[0] ?? 0)),
    uvMax: round(Number(data.daily.uv_index_max?.[0] ?? 0), 1),
    weatherText: WEATHER_CODE[Number(data.daily.weather_code?.[0])] ?? "changeable",
    tempRange: round(temps.length ? Math.max(...temps) - Math.min(...temps) : maxTemp - minTemp, 1)
  };
}
