"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { RecordForm } from "@/components/RecordForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { addRecord } from "@/app/actions/records";
import { getRecords } from "@/app/actions/records";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

interface DashboardClientProps {
    user: {
        id: number;
        username: string;
        avatar: string | null;
        role: string;
    };
    initialRecords: Array<{
        id: number;
        userId: number;
        date: string;
        count: number;
        durationMinutes: number | null;
        createdAt: string;
    }>;
    defaultStartDate: string;
    defaultEndDate: string;
}

export function DashboardClient({
    user,
    initialRecords,
    defaultStartDate,
    defaultEndDate,
}: DashboardClientProps) {
    const [records, setRecords] = useState(initialRecords);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Convert records to heatmap data
    const heatmapData: Record<string, { count: number; durationMinutes: number | null }> = {};
    records.forEach((r) => {
        heatmapData[r.date] = { count: r.count, durationMinutes: r.durationMinutes };
    });

    // Stats
    const totalDays = records.length;
    const totalCount = records.reduce((sum, r) => sum + r.count, 0);
    const totalMinutes = records.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

    const handleAddRecord = async (formData: FormData): Promise<{ error?: string; success?: boolean }> => {
        const result = await addRecord(formData);
        if (result.success) {
            // Refresh records
            startTransition(async () => {
                const updated = await getRecords(startDate, endDate);
                setRecords(updated);
            });
        }
        return result;
    };

    const handleDateRangeChange = useCallback(() => {
        startTransition(async () => {
            const updated = await getRecords(startDate, endDate);
            setRecords(updated);
        });
    }, [startDate, endDate]);

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-sm">
                            <span className="text-sm">🏃</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">蹦叽下</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user.username[0].toUpperCase()
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                                {user.username}
                            </span>
                        </Link>
                        {user.role === "admin" && (
                            <Link
                                href="/admin"
                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                           bg-purple-50 text-purple-600 hover:bg-purple-100
                           dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40
                           transition-colors"
                            >
                                管理
                            </Link>
                        )}
                        <form action={logout}>
                            <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:text-gray-700 
                           hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                           transition-colors"
                            >
                                退出
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
                    {[
                        { label: "运动天数", value: totalDays, suffix: "天", icon: "📅" },
                        { label: "总跳绳数", value: totalCount.toLocaleString("zh-CN"), suffix: "次", icon: "🔥" },
                        { label: "总时长", value: totalMinutes, suffix: "分钟", icon: "⏱️" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                         border border-gray-200/60 dark:border-gray-800/60 p-4
                         shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="text-lg mb-1">{stat.icon}</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                                    {stat.suffix}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Heatmap */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-6 mb-8
                        shadow-sm animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            📊 跳绳热力图
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs
                           focus:ring-2 focus:ring-emerald-500/40"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs
                           focus:ring-2 focus:ring-emerald-500/40"
                            />
                            <button
                                onClick={handleDateRangeChange}
                                disabled={isPending}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                           bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                           dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40
                           transition-colors disabled:opacity-50"
                            >
                                {isPending ? "加载..." : "查询"}
                            </button>
                        </div>
                    </div>
                    <CalendarHeatmap
                        data={heatmapData}
                        startDate={new Date(startDate)}
                        endDate={new Date(endDate)}
                        onDateClick={handleDateClick}
                    />
                </div>

                {/* Record Form */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-6
                        shadow-sm animate-fade-in">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        ✏️ 添加记录
                    </h2>
                    <RecordForm onSubmit={handleAddRecord} initialDate={selectedDate || undefined} />
                </div>

                {/* Recent Records */}
                {records.length > 0 && (
                    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                          border border-gray-200/60 dark:border-gray-800/60 p-6 mt-8
                          shadow-sm animate-fade-in">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                            📋 最近记录
                        </h2>
                        <div className="space-y-2">
                            {[...records]
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .slice(0, 10)
                                .map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between py-2.5 px-3 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {record.date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {record.count.toLocaleString("zh-CN")} 次
                                            </span>
                                            {record.durationMinutes && (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {record.durationMinutes} 分钟
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
