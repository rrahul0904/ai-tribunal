import { NextResponse } from "next/server";
import { getCase } from "@/lib/demo-data";
import { generateDemoReply } from "@/lib/demo-model";
import { assertHearingOwner, normalizeHearingMessage, requireSameOrigin } from "@/lib/request-guards.mjs";
import { core, creditVisitor, getBalance, getHearing, saveHearing, startDemoHearing } from "@/lib/runtime-store";
import { getVisitorId } from "@/lib/visitor";

function assertBrowserMutation(request: Request) {
  requireSameOrigin(request.url, request.headers.get("origin"), process.env.APP_ORIGIN);
}

export async function POST(request: Request) {
  try {
    assertBrowserMutation(request);
    const { caseSlug } = await request.json();
    const caseFile = getCase(caseSlug);
    if (!caseFile) return NextResponse.json({ error: "case not found" }, { status: 404 });
    const visitor = await getVisitorId({ create: true });
    if (!visitor) throw new Error("visitor unavailable");
    creditVisitor(visitor, 2);
    const hearing = startDemoHearing(caseFile, visitor);
    const response = NextResponse.json({ ...hearing, balance: getBalance(visitor) });
    response.cookies.set("tribunal_visitor", visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to start hearing";
    return NextResponse.json({ error: message }, { status: message.includes("origin") ? 403 : 400 });
  }
}

export async function PUT(request: Request) {
  try {
    assertBrowserMutation(request);
    const { hearingId, message } = await request.json();
    const visitor = await getVisitorId();
    const hearing = assertHearingOwner(getHearing(hearingId), visitor);
    const caseFile = getCase(hearing.caseId);
    if (!caseFile) return NextResponse.json({ error: "case not found" }, { status: 404 });

    const cleanMessage = normalizeHearingMessage(message);
    const withUser = core.recordUserMessage(hearing, cleanMessage);
    const reply = await generateDemoReply(caseFile, withUser, cleanMessage);
    const withAi = core.recordAiMessage(withUser, reply);
    saveHearing(withAi);
    return NextResponse.json({ ...withAi, balance: getBalance(withAi.visitorId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to continue hearing";
    const status = message.includes("origin") ? 403 : message.includes("not found") ? 404 : message.includes("limit") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
