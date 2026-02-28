"use client";

import {
    Line,
    LineChart,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

const lineChartConfig = {
    count: {
        label: "跳绳次数",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const barChartConfig = {
    duration: {
        label: "时长（分钟）",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function JumpCharts({ records }: JumpChartsProps) {
    // Sort by date and prepare chart data (most recent 30 days with records)
    const chartData = [...records]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
        .map((r) => ({
            date: formatDateShort(r.date),
            count: r.count,
            duration: r.durationMinutes || 0,
        }));

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart - Jump Count Trend */}
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                        📈 跳绳趋势
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={lineChartConfig} className="h-64 w-full">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                fontSize={11}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={45}
                                fontSize={11}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="跳绳次数"
                                stroke="var(--color-count)"
                                strokeWidth={2.5}
                                dot={{ r: 5, fill: "var(--color-count)", stroke: "var(--background)", strokeWidth: 2.5 }}
                                activeDot={{ r: 7, fill: "var(--color-count)", stroke: "var(--background)", strokeWidth: 2.5 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Bar Chart - Daily Duration */}
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                        📊 每日时长
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-64 w-full">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                fontSize={11}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={45}
                                fontSize={11}
                                unit="分"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar
                                dataKey="duration"
                                name="时长（分钟）"
                                fill="var(--color-duration)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
