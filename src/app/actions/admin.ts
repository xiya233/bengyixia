"use server";

import { db } from "@/db";
import { users, jumpRecords } from "@/db/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        throw new Error("需要管理员权限");
    }
    return user;
}

export async function listUsers() {
    await requireAdmin();
    return db.select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
    }).from(users).all();
}

export async function createUser(formData: FormData) {
    await requireAdmin();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "user";

    if (!username || !password) {
        return { error: "用户名和密码不能为空" };
    }

    const existing = db.select().from(users).where(eq(users.username, username)).get();
    if (existing) {
        return { error: "用户名已存在" };
    }

    const passwordHash = await hashPassword(password);
    db.insert(users).values({ username, passwordHash, role }).run();
    return { success: true };
}

export async function banUser(userId: number) {
    const admin = await requireAdmin();
    if (admin.id === userId) return { error: "不能封禁自己" };

    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return { error: "用户不存在" };
    if (user.role === "admin") return { error: "不能封禁管理员" };

    db.update(users).set({ status: "banned" }).where(eq(users.id, userId)).run();
    return { success: true };
}

export async function unbanUser(userId: number) {
    await requireAdmin();
    db.update(users).set({ status: "active" }).where(eq(users.id, userId)).run();
    return { success: true };
}

export async function deleteUser(userId: number) {
    const admin = await requireAdmin();
    if (admin.id === userId) return { error: "不能删除自己" };

    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return { error: "用户不存在" };
    if (user.role === "admin") return { error: "不能删除管理员" };

    // Delete user's records first, then the user
    db.delete(jumpRecords).where(eq(jumpRecords.userId, userId)).run();
    db.delete(users).where(eq(users.id, userId)).run();
    return { success: true };
}
