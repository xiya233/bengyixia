import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { db } from "@/db";
import { jumpRecords } from "@/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { getSiteSettings } from "@/app/actions/settings";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const settings = await getSiteSettings();

    // Default: past year
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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

    return (
        <DashboardClient
            user={{
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
            }}
            initialRecords={records}
            defaultStartDate={startDate}
            defaultEndDate={endDate}
            siteTitle={settings.site_title || "蹦叽下"}
        />
    );
}
