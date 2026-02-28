"use server";

import { db } from "@/db";
import { users, siteSettings } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
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

    // Get configurable max avatar size
    const sizeSetting = db.select().from(siteSettings).where(eq(siteSettings.key, "max_avatar_size_mb")).get();
    const maxSizeMB = parseInt(sizeSetting?.value || "5");

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { error: `头像文件大小不能超过 ${maxSizeMB}MB` };
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

export async function changePassword(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "请先登录" };

    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return { error: "所有密码字段不能为空" };
    }

    if (newPassword.length < 6) {
        return { error: "新密码长度至少 6 个字符" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "两次输入的新密码不一致" };
    }

    // Verify old password
    const dbUser = db.select().from(users).where(eq(users.id, user.id)).get();
    if (!dbUser) return { error: "用户不存在" };

    const valid = await verifyPassword(oldPassword, dbUser.passwordHash);
    if (!valid) {
        return { error: "旧密码错误" };
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    db.update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id))
        .run();

    return { success: true };
}
