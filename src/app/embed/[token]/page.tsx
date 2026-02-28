import { getShareData } from "@/app/actions/share";
import { notFound } from "next/navigation";
import { EmbedClient } from "./EmbedClient";

export default async function EmbedPage({
    params,
    searchParams,
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ type?: string }>;
}) {
    const { token } = await params;
    const { type } = await searchParams;
    const data = await getShareData(token);

    if (!data) {
        notFound();
    }

    const chartType = (type || "heatmap") as "heatmap" | "line" | "bar";

    return <EmbedClient data={data} chartType={chartType} />;
}
