"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useMemo } from "react";

interface HeatmapData {
    [date: string]: { count: number; durationMinutes: number | null };
}

interface CalendarHeatmapProps {
    data: HeatmapData;
    startDate: Date;
    endDate: Date;
    onDateClick?: (date: string) => void;
}

function getLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 500) return 1;
    if (count <= 1500) return 2;
    if (count <= 3000) return 3;
    return 4;
}

const LIGHT_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

const MONTHS_ZH = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS_ZH = ["一", "三", "五"];

function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

function formatDateChinese(dateStr: string): string {
    const [year, month, day] = dateStr.split("-");
    return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

function formatNumber(n: number): string {
    return n.toLocaleString("zh-CN");
}

export function CalendarHeatmap({ data, startDate, endDate, onDateClick }: CalendarHeatmapProps) {
    const { theme } = useTheme();
    const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
    const [tooltip, setTooltip] = useState<{
        date: string;
        count: number;
        duration: number | null;
        x: number;
        y: number;
    } | null>(null);

    const { weeks, monthLabels } = useMemo(() => {
        const weeks: { date: Date; dateStr: string }[][] = [];
        const monthRanges: { label: string; col: number }[] = [];

        const current = new Date(startDate);
        // Align to Monday
        const dayOfWeek = current.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        current.setDate(current.getDate() - diff);

        let weekIndex = 0;
        let lastYearMonth = "";
        let lastYear = -1;

        while (current <= endDate || weeks.length === 0) {
            const week: { date: Date; dateStr: string }[] = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(current);
                week.push({ date: d, dateStr: formatDate(d) });

                if (d >= startDate && d <= endDate) {
                    const year = d.getFullYear();
                    const month = d.getMonth();
                    const ym = `${year}-${month}`;
                    if (ym !== lastYearMonth) {
                        lastYearMonth = ym;
                        // Show year label when year changes
                        if (year !== lastYear) {
                            lastYear = year;
                            // For Jan or first month of a new year, show "YYYY年"
                            monthRanges.push({ label: `${year}`, col: weekIndex });
                        }
                        monthRanges.push({ label: MONTHS_ZH[month], col: weekIndex });
                    }
                }

                current.setDate(current.getDate() + 1);
            }
            weeks.push(week);
            weekIndex++;

            if (current > endDate && week[6].date > endDate) break;
        }

        // Filter labels that are too close (< 3 cols apart)
        const monthLabels = monthRanges.filter((m, i) => {
            if (i === 0) return true;
            return m.col - monthRanges[i - 1].col >= 3;
        });

        return { weeks, monthLabels };
    }, [startDate, endDate]);

    const cellSize = 13;
    const cellGap = 3;
    const labelW = 28;
    const headerH = 20;
    const svgWidth = labelW + weeks.length * (cellSize + cellGap);
    const svgHeight = headerH + 7 * (cellSize + cellGap);

    return (
        <div className="relative">
            <div className="overflow-x-auto pb-2">
                <svg width={svgWidth} height={svgHeight} className="block">
                    {/* Month labels */}
                    {monthLabels.map((m, i) => (
                        <text
                            key={i}
                            x={labelW + m.col * (cellSize + cellGap)}
                            y={12}
                            className="fill-gray-500 dark:fill-gray-400"
                            fontSize={10}
                            fontFamily="system-ui, sans-serif"
                        >
                            {m.label}
                        </text>
                    ))}

                    {/* Weekday labels */}
                    {WEEKDAYS_ZH.map((label, i) => (
                        <text
                            key={label}
                            x={0}
                            y={headerH + (i * 2) * (cellSize + cellGap) + cellSize - 2}
                            className="fill-gray-400 dark:fill-gray-500"
                            fontSize={9}
                            fontFamily="system-ui, sans-serif"
                        >
                            {label}
                        </text>
                    ))}

                    {/* Cells */}
                    {weeks.map((week, wi) =>
                        week.map((day, di) => {
                            const isInRange = day.date >= startDate && day.date <= endDate;
                            if (!isInRange) return null;

                            const record = data[day.dateStr];
                            const count = record?.count || 0;
                            const level = getLevel(count);
                            const color = colors[level];

                            return (
                                <rect
                                    key={day.dateStr}
                                    x={labelW + wi * (cellSize + cellGap)}
                                    y={headerH + di * (cellSize + cellGap)}
                                    width={cellSize}
                                    height={cellSize}
                                    rx={2}
                                    ry={2}
                                    fill={color}
                                    className="cursor-pointer transition-all duration-150 hover:brightness-110 hover:ring-1"
                                    stroke={tooltip?.date === day.dateStr ? (theme === "dark" ? "#58a6ff" : "#0969da") : "transparent"}
                                    strokeWidth={tooltip?.date === day.dateStr ? 1.5 : 0}
                                    onMouseEnter={() => {
                                        const cellX = labelW + wi * (cellSize + cellGap) + cellSize / 2;
                                        const cellY = headerH + di * (cellSize + cellGap);
                                        setTooltip({
                                            date: day.dateStr,
                                            count,
                                            duration: record?.durationMinutes || null,
                                            x: cellX,
                                            y: cellY,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => onDateClick?.(day.dateStr)}
                                />
                            );
                        })
                    )}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>少</span>
                {colors.map((color, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                    />
                ))}
                <span>多</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute z-50 pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 
                          text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap
                          border border-gray-700 dark:border-gray-300">
                        <div className="font-medium">{formatDateChinese(tooltip.date)}</div>
                        <div className="mt-0.5">
                            {tooltip.count > 0
                                ? `跳了 ${formatNumber(tooltip.count)} 次`
                                : "没有记录"}
                            {tooltip.duration && ` · ${tooltip.duration} 分钟`}
                        </div>
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                          border-l-[5px] border-l-transparent
                          border-r-[5px] border-r-transparent
                          border-t-[5px] border-t-gray-900 dark:border-t-gray-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
