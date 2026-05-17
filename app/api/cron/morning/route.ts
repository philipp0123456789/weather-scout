import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config";
import { runMorningJob } from "@/lib/morning";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function jsonNoStore(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  const isVercelCron = vercelCronHeader === "1";
  const isManualAuthorized = env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;

  if (env.CRON_SECRET && !isVercelCron && !isManualAuthorized) {
    return jsonNoStore({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const result = await runMorningJob();
    return jsonNoStore(result);
  } catch (error) {
    console.error(error);
    return jsonNoStore(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
}
