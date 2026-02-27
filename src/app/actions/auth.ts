"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
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
    const userCount = db.select().from(users).all().length;
    const role = userCount === 0 ? "admin" : "user";

    const result = db.insert(users).values({
        username,
        passwordHash,
        role,
    }).returning().get();

    await createSession(result.id, result.role);
    redirect("/dashboard");
}

export async function login(formData: FormData) {
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
