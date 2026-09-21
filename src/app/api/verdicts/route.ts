import { NextResponse } from "next/server";
import { assertHearingOwner, normalizeVerdict, requireSameOrigin } from "@/lib/request-guards.mjs";
import { core, getBalance, getHearing, saveHearing, spendCredit } from "@/lib/runtime-store";
import { getVisitorId } from "@/lib/visitor";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request.url, request.headers.get("origin"), process.env.APP_ORIGIN);
    const { hearingId, verdict } = await request.json();
    const visitor = await getVisitorId();
    const hearing = assertHearingOwner(getHearing(hearingId), visitor);
    const cleanVerdict = normalizeVerdict(verdict);

    if (cleanVerdict === "SPARE") spendCredit(hearing.visitorId, "CLEMENCY");
    const closed = core.submitVerdict(hearing, cleanVerdict);
    saveHearing(closed);
    return NextResponse.json({ ...closed, balance: getBalance(closed.visitorId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to submit verdict";
    const status = message.includes("origin") ? 403 : message.includes("not found") ? 404 : message.includes("insufficient") ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
