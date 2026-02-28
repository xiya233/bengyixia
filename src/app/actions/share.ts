"use server";

import { db } from "@/db";
import { users, jumpRecords } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function toggleShare() {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    if (user.shareToken) {
        // Disable sharing
        db.update(users)
            .set({ shareToken: null })
            .where(eq(users.id, user.id))
            .run();
        return { success: true, shareToken: null };
    } else {
        // Enable sharing with new UUID
        const token = randomUUID();
        db.update(users)
            .set({ shareToken: token })
            .where(eq(users.id, user.id))
            .run();
        return { success: true, shareToken: token };
    }
}

export async function getShareData(token: string) {
    const user = db
        .select()
        .from(users)
        .where(eq(users.shareToken, token))
        .get();

    if (!user || user.status === "banned") {
        return null;
    }

    // Get records for the past year
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const startDate = oneYearAgo.toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    const records = db
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

    return {
        user: {
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
        },
        records,
        startDate,
        endDate,
    };
}
