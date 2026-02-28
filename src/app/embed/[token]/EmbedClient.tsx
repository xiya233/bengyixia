"use client";

import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { EmbedLineChart } from "@/components/EmbedCharts";
import { EmbedBarChart } from "@/components/EmbedCharts";

interface EmbedData {
    user: {
        username: string;
        avatar: string | null;
        bio: string | null;
    };
    records: Array<{
        id: number;
        userId: number;
        date: string;
        count: number;
        durationMinutes: number | null;
        createdAt: string;
    }>;
    startDate: string;
    endDate: string;
}

export function EmbedClient({
    data,
    chartType,
}: {
    data: EmbedData;
    chartType: "heatmap" | "line" | "bar";
}) {
    const { user, records, startDate, endDate } = data;

    // Heatmap data
    const heatmapData: Record<string, { count: number; durationMinutes: number | null }> = {};
    records.forEach((r) => {
        heatmapData[r.date] = { count: r.count, durationMinutes: r.durationMinutes };
    });

    return (
        <html>
            <body style={{ margin: 0, padding: "12px", background: "transparent", fontFamily: "system-ui, sans-serif" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>{user.username}</span>
                    <span>的跳绳记录</span>
                </div>

                {chartType === "heatmap" && (
                    <CalendarHeatmap
                        data={heatmapData}
                        startDate={new Date(startDate)}
                        endDate={new Date(endDate)}
                    />
                )}

                {chartType === "line" && (
                    <EmbedLineChart records={records} />
                )}

                {chartType === "bar" && (
                    <EmbedBarChart records={records} />
                )}

                <div style={{ marginTop: "8px", fontSize: "10px", color: "#9ca3af", textAlign: "right" }}>
                    Powered by 蹦叽下
                </div>
            </body>
        </html>
    );
}
