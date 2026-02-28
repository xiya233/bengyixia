"use server";

import { db } from "@/db";
import { users, siteSettings } from "@/db/schema";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
    // Verify captcha if enabled
    const captchaSetting = db.select().from(siteSettings).where(eq(siteSettings.key, "captcha_enabled")).get();
    if (captchaSetting?.value !== "false") {
        const captchaId = formData.get("captchaId") as string;
        const captchaAnswer = formData.get("captchaAnswer") as string;
        if (!captchaId || !captchaAnswer || !verifyCaptcha(captchaId, captchaAnswer)) {
            return { error: "验证码错误" };
        }
    }

    // Check if registration is enabled (first user always allowed)
    const userCount = db.select().from(users).all().length;
    if (userCount > 0) {
        const regSetting = db.select().from(siteSettings).where(eq(siteSettings.key, "registration_enabled")).get();
        if (regSetting?.value === "false") {
            return { error: "管理员已关闭注册功能" };
        }
    }
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "用户名和密码不能为空" };
    }

    if (username.length < 3 || username.length > 20) {
        return { error: "用户名长度需在 3-20 个字符之间" };
    }

    if (password.length < 6) {
        return { error: "密码长度至少 6 个字符" };
    }

    const existing = db.select().from(users).where(eq(users.username, username)).get();
    if (existing) {
        return { error: "用户名已存在" };
    }

    const passwordHash = await hashPassword(password);

    // First user is admin
    const role = userCount === 0 ? "admin" : "user";

    db.insert(users).values({
        username,
        passwordHash,
        role,
    }).run();

    return { success: true };
}

export async function login(formData: FormData) {
    // Verify captcha if enabled
    const captchaSetting = db.select().from(siteSettings).where(eq(siteSettings.key, "captcha_enabled")).get();
    if (captchaSetting?.value !== "false") {
        const captchaId = formData.get("captchaId") as string;
        const captchaAnswer = formData.get("captchaAnswer") as string;
        if (!captchaId || !captchaAnswer || !verifyCaptcha(captchaId, captchaAnswer)) {
            return { error: "验证码错误" };
        }
    }

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "用户名和密码不能为空" };
    }

    const user = db.select().from(users).where(eq(users.username, username)).get();

    if (!user) {
        return { error: "用户名或密码错误" };
    }

    if (user.status === "banned") {
        return { error: "账号已被封禁，请联系管理员" };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        return { error: "用户名或密码错误" };
    }

    await createSession(user.id, user.role);
    redirect("/dashboard");
}

export async function logout() {
    await destroySession();
    redirect("/");
}
