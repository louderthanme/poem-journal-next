// src/app/api/auth/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API is working! finally" });
}
