"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartRecord {
    date: string;
    count: number;
    durationMinutes: number | null;
}

function formatDateShort(dateStr: string): string {
    const [, month, day] = dateStr.split("-");
    return `${parseInt(month)}/${parseInt(day)}`;
}

function prepareData(records: ChartRecord[]) {
    return [...records]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map((r) => ({
            date: formatDateShort(r.date),
            count: r.count,
            duration: r.durationMinutes || 0,
        }));
}

export function EmbedLineChart({ records }: { records: ChartRecord[] }) {
    const data = prepareData(records);
    if (data.length === 0) return <div style={{ color: "#9ca3af", fontSize: 12 }}>暂无数据</div>;

    return (
        <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        name="跳绳次数"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function EmbedBarChart({ records }: { records: ChartRecord[] }) {
    const data = prepareData(records);
    if (data.length === 0) return <div style={{ color: "#9ca3af", fontSize: 12 }}>暂无数据</div>;

    return (
        <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        width={40}
                        unit="分"
                    />
                    <Tooltip
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    />
                    <Bar
                        dataKey="duration"
                        name="时长（分钟）"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
