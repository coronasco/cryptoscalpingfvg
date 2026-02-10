import { NextResponse } from "next/server";
import { bybitSocket } from "@/lib/market/bybit";

export async function GET() {
  return NextResponse.json(bybitSocket.health());
}
