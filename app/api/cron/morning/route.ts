import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config";
import { runMorningJob } from "@/lib/morning";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  const isVercelCron = vercelCronHeader === "1";
  const isManualAuthorized = env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`;

  if (env.CRON_SECRET && !isVercelCron && !isManualAuthorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMorningJob();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
