import { getProfile, upsertRecommendation } from "./db";
import { calculateRecommendation } from "./outfit";
import { sendMorningRecommendation } from "./telegram";
import { fetchWeather } from "./weather";

export async function runMorningJob() {
  const profile = await getProfile();
  const weather = await fetchWeather(profile);
  const recommendation = calculateRecommendation(weather, profile);
  const record = await upsertRecommendation({ profile, weather, recommendation });
  const telegram = await sendMorningRecommendation(profile, weather, recommendation);

  return {
    ok: true,
    profile,
    weather,
    recommendation,
    recordId: record.id,
    telegramMessageId: telegram.result?.message_id ?? null
  };
}
