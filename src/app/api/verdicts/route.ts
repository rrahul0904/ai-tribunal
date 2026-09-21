import { NextResponse } from "next/server";
import { core, getBalance, getHearing, saveHearing, spendCredit } from "@/lib/runtime-store";

export async function POST(request: Request) {
  try {
    const { hearingId, verdict } = await request.json();
    const hearing = getHearing(hearingId);
    if (!hearing) return NextResponse.json({ error: "hearing not found" }, { status: 404 });

    if (verdict === "SPARE") spendCredit(hearing.visitorId, "CLEMENCY");
    const closed = core.submitVerdict(hearing, verdict);
    saveHearing(closed);
    return NextResponse.json({ ...closed, balance: getBalance(closed.visitorId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to submit verdict";
    return NextResponse.json({ error: message }, { status: message.includes("insufficient") ? 402 : 400 });
  }
}
