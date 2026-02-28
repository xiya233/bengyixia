import { getShareData } from "@/app/actions/share";
import { notFound } from "next/navigation";
import { SharePageClient } from "./SharePageClient";

export default async function SharePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const data = await getShareData(token);

    if (!data) {
        notFound();
    }

    return <SharePageClient data={data} />;
}
