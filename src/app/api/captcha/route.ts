import { createCaptcha } from "@/lib/captcha";
import { NextResponse } from "next/server";

export async function GET() {
    const { id, svg } = createCaptcha();
    return NextResponse.json({ id, svg });
}

export const dynamic = "force-dynamic";
