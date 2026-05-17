import type { Recommendation, UserProfile, WeatherSummary } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateRecommendation(weather: WeatherSummary, profile: UserProfile): Recommendation {
  const personal = Number(profile.warmth_offset || 0);

  let effectiveTemp = weather.morningFeels - personal * 1.8;

  if (profile.wind_sensitive && weather.windMax >= 25) effectiveTemp -= 2;
  else if (profile.wind_sensitive && weather.windMax >= 15) effectiveTemp -= 1;

  if (profile.rain_sensitive && weather.precipProbMax >= 60) effectiveTemp -= 1;

  let score: number;
  if (effectiveTemp < 3) score = 0;
  else if (effectiveTemp < 8) score = 1;
  else if (effectiveTemp < 13) score = 2;
  else if (effectiveTemp < 17) score = 3;
  else if (effectiveTemp < 21) score = 4;
  else if (effectiveTemp < 25) score = 5;
  else score = 6;

  score = clamp(score, 0, 6);

  const outfits: Record<number, string> = {
    0: "winter coat, warm sweater, long trousers, warm shoes",
    1: "warm jacket, sweater, T-shirt underneath, long trousers",
    2: "light-to-medium jacket, sweater, T-shirt underneath",
    3: "light jacket or cardigan, T-shirt, long trousers or skirt with tights",
    4: "T-shirt plus a thin sweater/cardigan for the morning",
    5: "T-shirt or top, light trousers or skirt",
    6: "very light T-shirt/top, skirt or short clothes, sunglasses"
  };

  const notes: string[] = [];
  if (weather.precipProbMax >= 60) notes.push("Take an umbrella or rain jacket");
  else if (weather.precipProbMax >= 35) notes.push("Pack a small umbrella, rain is possible");

  if (weather.windMax >= 30) notes.push("Because of the wind, choose one warmer layer");
  else if (weather.windMax >= 20) notes.push("The wind may make it feel cooler than it looks");

  if (weather.tempRange >= 10) notes.push("Layering is useful because the temperature changes a lot during the day");
  if (weather.uvMax >= 6) notes.push("Sunglasses and maybe sunscreen are sensible");

  let skirtAdvice = "";
  if (profile.prefers_skirt) {
    if (score <= 2) skirtAdvice = "A skirt is only comfortable with warm tights today.";
    else if (score === 3) skirtAdvice = "A skirt is possible, but tights or a jacket are safer in the morning.";
    else skirtAdvice = "A skirt should be fine weather-wise today.";
  }

  const headline = score <= 1
    ? "Dress warmly today"
    : score <= 3
      ? "Use layers today"
      : score <= 5
        ? "Dress fairly light, but keep a backup layer"
        : "Dress very lightly today";

  const details = [outfits[score], ...notes, skirtAdvice].filter(Boolean).join(". ");

  return {
    score,
    effectiveTemp: round(effectiveTemp, 1),
    headline,
    outfit: outfits[score],
    notes,
    skirtAdvice,
    message: `${headline}: ${details}.`
  };
}

export function applyFeedbackToOffset(currentOffset: number, feedback: string) {
  const normalized = feedback.toLowerCase();
  const delta = normalized === "too_cold" ? 0.25 : normalized === "too_warm" ? -0.25 : 0;
  return clamp(round(currentOffset + delta, 2), -2, 2);
}
