"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import sharp from "sharp";

export async function updateProfile(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    const bio = formData.get("bio") as string;

    db.update(users)
        .set({ bio: bio || null })
        .where(eq(users.id, user.id))
        .run();

    return { success: true };
}

export async function uploadAvatar(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    const file = formData.get("avatar") as File;
    if (!file || file.size === 0) return { error: "请选择头像文件" };

    if (file.size > 5 * 1024 * 1024) {
        return { error: "头像文件大小不能超过 5MB" };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return { error: "仅支持 JPG、PNG、WebP、GIF 格式" };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Delete old avatar
    if (user.avatar) {
        const oldPath = path.join(process.cwd(), "public", user.avatar);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const fileName = `avatar_${user.id}_${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await sharp(buffer)
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(filePath);

    const avatarUrl = `/uploads/${fileName}`;
    db.update(users)
        .set({ avatar: avatarUrl })
        .where(eq(users.id, user.id))
        .run();

    return { success: true, avatar: avatarUrl };
}
