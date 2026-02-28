import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    return (
        <ProfileClient
            user={{
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                shareToken: user.shareToken,
                createdAt: user.createdAt,
            }}
        />
    );
}
