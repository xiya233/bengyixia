"use server";

import { db } from "@/db";
import { siteSettings, announcements } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        throw new Error("无权限");
    }
    return user;
}

// ---- Site Settings ----

export async function getSiteSettings() {
    const rows = db.select().from(siteSettings).all();
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
        settings[r.key] = r.value;
    });
    return settings;
}

export async function updateSiteSetting(key: string, value: string) {
    await requireAdmin();
    db.insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value } })
        .run();
    revalidatePath("/");
    return { success: true };
}

// ---- Announcements ----

export async function getAnnouncements() {
    return db.select().from(announcements).orderBy(announcements.id).all().reverse();
}

export async function createAnnouncement(formData: FormData) {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    if (!title || !content) return { error: "标题和内容不能为空" };

    db.insert(announcements).values({ title, content }).run();
    revalidatePath("/");
    return { success: true };
}

export async function deleteAnnouncement(id: number) {
    await requireAdmin();
    db.delete(announcements).where(eq(announcements.id, id)).run();
    revalidatePath("/");
    return { success: true };
}
