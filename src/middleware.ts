import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "jump-rope-app-secret-key-2024-super-secure"
);

const protectedRoutes = ["/dashboard", "/profile", "/admin"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    if (!isProtected) return NextResponse.next();

    const token = request.cookies.get("session")?.value;
    if (!token) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
        if (isAdminRoute && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
};
