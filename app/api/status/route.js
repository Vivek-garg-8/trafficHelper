// app/api/status/route.js
import { NextResponse } from "next/server";

if (!globalThis.latestTrafficStatus) {
  globalThis.latestTrafficStatus = {
    override: false,
    totalCycleTime: 40,
    lightCycle: [
      { state: "Green", duration: 20 },
      { state: "Yellow", duration: 5 },
      { state: "Red", duration: 15 },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (
      typeof body.totalCycleTime !== "number" ||
      !Array.isArray(body.lightCycle)
    ) {
      return NextResponse.json(
        { error: "invalid payload" },
        { status: 400 }
      );
    }

    globalThis.latestTrafficStatus = {
      ...globalThis.latestTrafficStatus,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    console.log("Updated traffic status:", globalThis.latestTrafficStatus);

    return NextResponse.json({ ok: true, status: globalThis.latestTrafficStatus });
  } catch (err) {
    console.error("POST /api/status error:", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(globalThis.latestTrafficStatus);
}
