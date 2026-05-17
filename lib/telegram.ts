import { env } from "./config";
import type { Recommendation, UserProfile, WeatherSummary } from "./types";

const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

type InlineKeyboardButton = {
  text: string;
  callback_data: string;
};

async function telegramRequest(method: string, body: unknown) {
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(json)}`);
  }
  return json;
}

function buildMessage(profile: UserProfile, weather: WeatherSummary, rec: Recommendation) {
  const rain = weather.precipProbMax >= 35 ? `\n☔ Rain chance: ${weather.precipProbMax}%` : "";
  const wind = weather.windMax >= 20 ? `\n💨 Wind: ${weather.windMax} km/h` : "";
  const notes = rec.notes.length ? `\n\nNotes:\n- ${rec.notes.join("\n- ")}` : "";
  const skirt = rec.skirtAdvice ? `\n${rec.skirtAdvice}` : "";

  return [
    `Good morning, ${profile.person_name} ☀️`,
    "",
    `Today in ${profile.city}: ${weather.weatherText}.`,
    `Morning: ${weather.morningTemp} °C, feels like ${weather.morningFeels} °C.`,
    `Later: up to ${weather.maxTemp} °C.${rain}${wind}`,
    "",
    `Recommendation: ${rec.outfit}.`,
    skirt,
    notes,
    "",
    `Profile: warmth offset ${profile.warmth_offset}. Tap feedback tonight or whenever you know how it felt.`
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function sendMorningRecommendation(profile: UserProfile, weather: WeatherSummary, rec: Recommendation) {
  const keyboard: InlineKeyboardButton[][] = [
    [
      { text: "✅ Good", callback_data: "feedback:good" },
      { text: "🥵 Too warm", callback_data: "feedback:too_warm" }
    ],
    [
      { text: "🥶 Too cold", callback_data: "feedback:too_cold" },
      { text: "🌧️ Rain/shoes bad", callback_data: "feedback:rain_bad" }
    ]
  ];

  return telegramRequest("sendMessage", {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: buildMessage(profile, weather, rec),
    reply_markup: { inline_keyboard: keyboard }
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text: string) {
  return telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false
  });
}

export async function sendText(text: string) {
  return telegramRequest("sendMessage", {
    chat_id: env.TELEGRAM_CHAT_ID,
    text
  });
}
