import { getProfile, getRecentRecommendations } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getProfile();
  const logs = await getRecentRecommendations(14);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Weather Scout</h1>
      <p>Telegram-based morning weather and outfit recommendations with feedback learning.</p>

      <section style={{ border: "1px solid #ddd", borderRadius: 16, padding: 16, marginTop: 24 }}>
        <h2>Current profile</h2>
        <p><b>Name:</b> {profile.person_name}</p>
        <p><b>City:</b> {profile.city}</p>
        <p><b>Morning time:</b> {profile.morning_time} ({profile.timezone})</p>
        <p><b>Warmth offset:</b> {profile.warmth_offset}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recent recommendations</h2>
        {logs.length === 0 ? <p>No recommendations yet.</p> : null}
        <div style={{ display: "grid", gap: 12 }}>
          {logs.map((log: any) => (
            <article key={log.id} style={{ border: "1px solid #ddd", borderRadius: 16, padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>{log.date} — {log.city}</h3>
              <p><b>Weather:</b> {log.weather?.morningTemp} °C morning, max {log.weather?.maxTemp} °C, rain {log.weather?.precipProbMax}%</p>
              <p><b>Outfit:</b> {log.recommendation?.outfit}</p>
              <p><b>Feedback:</b> {log.feedback ?? "none yet"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
