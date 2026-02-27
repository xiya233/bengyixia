"use server";

import { db } from "@/db";
import { jumpRecords } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, gte, lte } from "drizzle-orm";

export async function addRecord(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    const date = formData.get("date") as string;
    const count = parseInt(formData.get("count") as string);
    const durationMinutes = formData.get("duration") ? parseInt(formData.get("duration") as string) : null;

    if (!date || isNaN(count) || count < 0) {
        return { error: "请填写有效的日期和跳绳次数" };
    }

    // 累计：如果当天已有记录，将次数和时长累加
    const existing = db
        .select()
        .from(jumpRecords)
        .where(and(eq(jumpRecords.userId, user.id), eq(jumpRecords.date, date)))
        .get();

    if (existing) {
        const newCount = existing.count + count;
        const newDuration = (existing.durationMinutes || 0) + (durationMinutes || 0);
        db.update(jumpRecords)
            .set({ count: newCount, durationMinutes: newDuration || null })
            .where(eq(jumpRecords.id, existing.id))
            .run();
    } else {
        db.insert(jumpRecords)
            .values({ userId: user.id, date, count, durationMinutes })
            .run();
    }

    return { success: true };
}

export async function deleteRecord(recordId: number) {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    const record = db.select().from(jumpRecords).where(eq(jumpRecords.id, recordId)).get();
    if (!record || record.userId !== user.id) {
        return { error: "记录不存在" };
    }

    db.delete(jumpRecords).where(eq(jumpRecords.id, recordId)).run();
    return { success: true };
}

export async function getRecords(startDate: string, endDate: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    return db
        .select()
        .from(jumpRecords)
        .where(
            and(
                eq(jumpRecords.userId, user.id),
                gte(jumpRecords.date, startDate),
                lte(jumpRecords.date, endDate)
            )
        )
        .all();
}
