// app/api/control/route.js
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const CONTROL_KEY = "trafficControl";
const defaultControl = {
  override: false,
  direction: 0, // 0 = N-S, 1 = E-W
  updatedAt: new Date().toISOString(),
};

const REQUIRE_SECRET = 0;
const CONTROL_SECRET = process.env.CONTROL_SECRET || "";

function validateDirection(d) {
  return d === 0 || d === 1;
}

export async function GET() {
  try {
    const stored = await redis.get(CONTROL_KEY);
    return NextResponse.json(stored ?? defaultControl);
  } catch (err) {
    console.error("GET /api/control error:", err);
    return NextResponse.json(defaultControl);
  }
}

export async function POST(request) {
  try {
    // optional simple auth
    if (REQUIRE_SECRET) {
      const headerSecret = request.headers.get("x-control-secret") || "";
      if (!CONTROL_SECRET || headerSecret !== CONTROL_SECRET) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();

    if (typeof body.override !== "boolean") {
      return NextResponse.json({ error: "Invalid payload: override must be boolean" }, { status: 400 });
    }
    if (body.direction !== undefined && !validateDirection(body.direction)) {
      return NextResponse.json({ error: "Invalid payload: direction must be 0 or 1" }, { status: 400 });
    }

    const current = (await redis.get(CONTROL_KEY)) ?? defaultControl;

    const newControl = {
      ...current,
      override: body.override,
      direction: body.direction !== undefined ? body.direction : current.direction,
      updatedAt: new Date().toISOString(),
    };

    if (typeof body.ttlSeconds === "number" && body.ttlSeconds > 0) {
      await redis.set(CONTROL_KEY, newControl);
      await redis.expire(CONTROL_KEY, Math.round(body.ttlSeconds));
    } else {
      await redis.set(CONTROL_KEY, newControl);
    }

    return NextResponse.json({ ok: true, control: newControl });
  } catch (err) {
    console.error("POST /api/control error:", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
