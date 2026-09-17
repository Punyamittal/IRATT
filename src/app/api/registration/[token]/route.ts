import { NextResponse } from "next/server";
import { noStore } from "@/lib/security";

type Params = { params: Promise<{ token: string }> };

/** Public token lookup is disabled — credentials are issued via httpOnly cookie + QR image. */
export async function GET(_request: Request, { params }: Params) {
  await params;
  return NextResponse.json({ error: "INVALID REGISTRATION TOKEN." }, noStore({ status: 404 }));
}
