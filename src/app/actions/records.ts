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

    // Upsert: if record exists for this date, update it
    const existing = db
        .select()
        .from(jumpRecords)
        .where(and(eq(jumpRecords.userId, user.id), eq(jumpRecords.date, date)))
        .get();

    if (existing) {
        db.update(jumpRecords)
            .set({ count, durationMinutes })
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
