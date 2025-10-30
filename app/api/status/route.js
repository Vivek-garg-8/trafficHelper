import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = 'force-dynamic';

// Initialize Redis client with environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Default data if Redis is empty
const defaultStatus = {
  override: false,
  totalCycleTime: 40,
  lightCycle: [
    { state: "Green", duration: 20 },
    { state: "Yellow", duration: 5 },
    { state: "Red", duration: 15 },
  ],
  updatedAt: new Date().toISOString(),
};

// Handle GET request → return saved or default data
export async function GET() {
  try {
    const stored = await redis.get("trafficStatus");
    return NextResponse.json(stored || defaultStatus);
  } catch (error) {
    console.error("GET /api/status error:", error);
    return NextResponse.json(defaultStatus);
  }
}

// Handle POST request → update and save new data
export async function POST(request) {
  try {
    const body = await request.json();

    if (
      typeof body.totalCycleTime !== "number" ||
      !Array.isArray(body.lightCycle)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const newStatus = {
      ...defaultStatus,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await redis.set("trafficStatus", newStatus);

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (error) {
    console.error("POST /api/status error:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
