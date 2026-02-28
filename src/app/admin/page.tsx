import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSiteSettings, getAnnouncements } from "@/app/actions/settings";

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") redirect("/dashboard");

    const allUsers = db.select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        bio: users.bio,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
    }).from(users).all();

    const settings = await getSiteSettings();
    const announcements = await getAnnouncements();

    return (
        <AdminClient
            currentUser={{ id: user.id, username: user.username }}
            users={allUsers}
            initialSettings={settings}
            initialAnnouncements={announcements}
        />
    );
}
