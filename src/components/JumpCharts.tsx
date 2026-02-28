"use client";

import { useTheme } from "./ThemeProvider";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

interface ChartRecord {
    date: string;
    count: number;
    durationMinutes: number | null;
}

interface JumpChartsProps {
    records: ChartRecord[];
}

function formatDateShort(dateStr: string): string {
    const [, month, day] = dateStr.split("-");
    return `${parseInt(month)}/${parseInt(day)}`;
}

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
            <div className="font-medium text-gray-900 dark:text-white mb-1">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-500 dark:text-gray-400">
                        {p.name}: <span className="text-gray-900 dark:text-white font-medium">{p.value.toLocaleString("zh-CN")}</span>
                    </span>
                </div>
            ))}
        </div>
    );
}

export function JumpCharts({ records }: JumpChartsProps) {
    const { theme } = useTheme();

    // Sort by date and prepare chart data (most recent 30 days with records)
    const chartData = [...records]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map((r) => ({
            date: formatDateShort(r.date),
            跳绳次数: r.count,
            时长: r.durationMinutes || 0,
        }));

    if (chartData.length === 0) {
        return null;
    }

    const gridColor = theme === "dark" ? "#1f2937" : "#f3f4f6";
    const textColor = theme === "dark" ? "#9ca3af" : "#6b7280";
    const lineColor = "#10b981";
    const barColor = "#06b6d4";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                            border border-gray-200/60 dark:border-gray-800/60 p-6
                            shadow-sm animate-fade-in">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    📈 跳绳趋势
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: textColor }}
                                tickLine={false}
                                axisLine={{ stroke: gridColor }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: textColor }}
                                tickLine={false}
                                axisLine={false}
                                width={45}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="跳绳次数"
                                stroke={lineColor}
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: lineColor, strokeWidth: 2, stroke: "#fff" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                            border border-gray-200/60 dark:border-gray-800/60 p-6
                            shadow-sm animate-fade-in">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    📊 每日时长
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: textColor }}
                                tickLine={false}
                                axisLine={{ stroke: gridColor }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: textColor }}
                                tickLine={false}
                                axisLine={false}
                                width={45}
                                unit="分"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="时长"
                                fill={barColor}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
