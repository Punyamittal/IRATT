import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getQrViewSession } from "@/lib/auth";
import { buildQrPayload } from "@/lib/format";
import { clientIp, noStore, rateLimit, rateLimitResponse } from "@/lib/security";

export async function GET(request: Request) {
  const limited = rateLimit(`qr:${clientIp(request)}`, 30, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter ?? 60);

  const view = await getQrViewSession();
  if (!view.token || !view.displayId) {
    return NextResponse.json({ error: "INVALID REGISTRATION TOKEN." }, noStore({ status: 401 }));
  }

  const png = await QRCode.toBuffer(buildQrPayload(view.token), {
    type: "png",
    width: 560,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#3d3228", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${view.displayId}-qr.png"`,
    },
  });
}
