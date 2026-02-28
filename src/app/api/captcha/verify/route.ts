import { verifyCaptcha } from "@/lib/captcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { id, answer } = await req.json();
    if (!id || !answer) {
        return NextResponse.json({ valid: false });
    }
    // Use non-consuming check (re-verify is allowed for UX feedback)
    const valid = verifyCaptcha(id, answer);
    return NextResponse.json({ valid });
}
