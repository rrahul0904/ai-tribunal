import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getCase } from "@/lib/demo-data";
import { generateDemoReply } from "@/lib/demo-model";
import { core, creditVisitor, getBalance, getHearing, saveHearing, startDemoHearing } from "@/lib/runtime-store";

async function visitorId() {
  const jar = await cookies();
  let id = jar.get("tribunal_visitor")?.value;
  if (!id) id = randomUUID();
  return id;
}

export async function POST(request: Request) {
  try {
    const { caseSlug } = await request.json();
    const caseFile = getCase(caseSlug);
    if (!caseFile) return NextResponse.json({ error: "case not found" }, { status: 404 });
    const visitor = await visitorId();
    creditVisitor(visitor, 2);
    const hearing = startDemoHearing(caseFile, visitor);
    const response = NextResponse.json({ ...hearing, balance: getBalance(visitor) });
    response.cookies.set("tribunal_visitor", visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch {
    return NextResponse.json({ error: "unable to start hearing" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { hearingId, message } = await request.json();
    const hearing = getHearing(hearingId);
    if (!hearing) return NextResponse.json({ error: "hearing not found" }, { status: 404 });
    const caseFile = getCase(hearing.caseId);
    if (!caseFile) return NextResponse.json({ error: "case not found" }, { status: 404 });

    const withUser = core.recordUserMessage(hearing, message);
    const reply = await generateDemoReply(caseFile, withUser, message);
    const withAi = core.recordAiMessage(withUser, reply);
    saveHearing(withAi);
    return NextResponse.json({ ...withAi, balance: getBalance(withAi.visitorId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to continue hearing";
    return NextResponse.json({ error: message }, { status: message.includes("limit") ? 409 : 400 });
  }
}
