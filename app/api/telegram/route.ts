import { NextRequest, NextResponse } from "next/server";
import { answerCallbackQuery, sendText } from "@/lib/telegram";
import { applyFeedbackToOffset } from "@/lib/outfit";
import { getProfile, updateFeedback } from "@/lib/db";

export const dynamic = "force-dynamic";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    message?: unknown;
  };
};

const LABELS: Record<string, string> = {
  good: "Good — I will keep the profile as it is.",
  too_warm: "Got it — next time I will recommend slightly lighter clothes.",
  too_cold: "Got it — next time I will recommend slightly warmer clothes.",
  rain_bad: "Got it — I will keep the temperature profile, but noted that rain/shoes were impractical."
};

export async function POST(request: NextRequest) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const callback = update.callback_query;

    if (!callback?.data?.startsWith("feedback:")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const feedback = callback.data.replace("feedback:", "");
    const profile = await getProfile();
    const newOffset = applyFeedbackToOffset(profile.warmth_offset, feedback);
    await updateFeedback(feedback, newOffset);

    await answerCallbackQuery(callback.id, LABELS[feedback] ?? "Feedback saved.");
    await sendText(`${LABELS[feedback] ?? "Feedback saved."}\nNew warmth offset: ${newOffset}`);

    return NextResponse.json({ ok: true, feedback, newOffset });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
