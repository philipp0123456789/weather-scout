# Weather Scout

Weather Scout is a Telegram-based personal weather and outfit assistant.

Every morning it:

1. fetches today's weather from Open-Meteo,
2. creates a concrete outfit recommendation,
3. sends it to Telegram,
4. stores the recommendation in Supabase,
5. learns from evening feedback.

Feedback buttons:

- Good
- Too warm
- Too cold
- Rain/shoes impractical

The bot updates a personal warmth offset over time. If she often says “too cold”, future recommendations become warmer. If she often says “too warm”, they become lighter.

## Stack

- Next.js API routes
- Telegram Bot API
- Open-Meteo weather API
- Supabase Postgres
- Vercel Cron or GitHub Actions

## 1. Supabase setup

Create a Supabase project and run `supabase/schema.sql` in the SQL editor.

## 2. Telegram setup

Create a bot with `@BotFather` and copy the bot token.

Then the person who should receive the notifications must open the bot and send a message such as `hi`.

Open this URL in the browser, replacing `YOUR_BOT_TOKEN` with the real token from BotFather:

```txt
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

Find the numeric `chat.id` in the response. This is `TELEGRAM_CHAT_ID`.

Example:

```json
"chat": {
  "id": 7512227828,
  "first_name": "Sommi",
  "username": "philipster",
  "type": "private"
}
```

Then use:

```bash
TELEGRAM_CHAT_ID=7512227828
```

Important: the Telegram username is not the chat ID. The chat ID is the numeric value.

Security note: if the token appeared in a screenshot, revoke it in BotFather and create a new API token before deploying.

## 3. Environment variables

Copy `.env.example` to `.env.local` locally and add the same variables in Vercel.

```bash
cp .env.example .env.local
```

Required variables:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_BASE_URL=
CRON_SECRET=
```

Optional defaults:

```bash
DEFAULT_PERSON_NAME=Lara
DEFAULT_CITY=Stuttgart
DEFAULT_LATITUDE=48.7758
DEFAULT_LONGITUDE=9.1829
DEFAULT_TIMEZONE=Europe/Berlin
DEFAULT_MORNING_TIME=07:30
```

## 4. Deploy to Vercel

Import this repo into Vercel and add the environment variables.

The included `vercel.json` runs `/api/cron/morning` every day at `05:30 UTC`, which equals `07:30` in Germany during summer time. In winter, change it to `06:30 UTC` or use the GitHub Actions workflow.

## 5. Set Telegram webhook

After Vercel deployment, call:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://YOUR-VERCEL-DOMAIN.vercel.app/api/telegram"
```

## 6. Manual test

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://YOUR-VERCEL-DOMAIN.vercel.app/api/cron/morning"
```

Local test:

```bash
npm install
npm run send:morning
```

## Notes

Telegram is used because native browser notifications are not reliable when the browser is closed. With Telegram, the morning notification is delivered to her phone without any browser tab staying open.
