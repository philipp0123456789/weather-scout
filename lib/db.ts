import { createClient } from "@supabase/supabase-js";
import { env } from "./config";
import type { Recommendation, UserProfile, WeatherSummary } from "./types";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export async function getProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profile")
    .select("*")
    .eq("id", "default")
    .single();

  if (error && error.code !== "PGRST116") throw error;

  if (data) return data as UserProfile;

  const fallback = {
    id: "default",
    person_name: env.DEFAULT_PERSON_NAME,
    city: env.DEFAULT_CITY,
    latitude: env.DEFAULT_LATITUDE,
    longitude: env.DEFAULT_LONGITUDE,
    timezone: env.DEFAULT_TIMEZONE,
    morning_time: env.DEFAULT_MORNING_TIME,
    warmth_offset: 0,
    wind_sensitive: true,
    rain_sensitive: true,
    prefers_skirt: true
  };

  const { data: inserted, error: insertError } = await supabase
    .from("user_profile")
    .insert(fallback)
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted as UserProfile;
}

export async function upsertRecommendation(args: {
  profile: UserProfile;
  weather: WeatherSummary;
  recommendation: Recommendation;
}) {
  const { profile, weather, recommendation } = args;
  const { data, error } = await supabase
    .from("daily_recommendations")
    .upsert(
      {
        profile_id: profile.id,
        date: weather.date,
        city: profile.city,
        weather,
        recommendation,
        warmth_offset_before: profile.warmth_offset,
        sent_at: new Date().toISOString()
      },
      { onConflict: "profile_id,date" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateFeedback(feedback: string, newOffset: number) {
  const profile = await getProfile();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: profile.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const { error: profileError } = await supabase
    .from("user_profile")
    .update({ warmth_offset: newOffset, updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (profileError) throw profileError;

  const { error: logError } = await supabase
    .from("daily_recommendations")
    .update({
      feedback,
      feedback_at: new Date().toISOString(),
      warmth_offset_after: newOffset
    })
    .eq("profile_id", profile.id)
    .eq("date", today);

  if (logError) throw logError;

  return { profile, newOffset };
}

export async function getRecentRecommendations(limit = 14) {
  const { data, error } = await supabase
    .from("daily_recommendations")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
