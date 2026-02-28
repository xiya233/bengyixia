"use client";

import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { JumpCharts } from "@/components/JumpCharts";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ShareData {
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

export function SharePageClient({ data }: { data: ShareData }) {
    const { user, records, startDate, endDate } = data;

    // Convert records to heatmap format
    const heatmapData: Record<string, { count: number; durationMinutes: number | null }> = {};
    records.forEach((r) => {
        heatmapData[r.date] = { count: r.count, durationMinutes: r.durationMinutes };
    });

    // Stats
    const totalDays = records.length;
    const totalCount = records.reduce((sum, r) => sum + r.count, 0);
    const totalMinutes = records.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

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
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* User Profile Card */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-6 mb-8
                        shadow-sm animate-slide-up text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 
                            flex items-center justify-center text-white text-xl font-bold 
                            overflow-hidden shadow-lg">
                            {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                user.username[0].toUpperCase()
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                            {user.username}
                        </h2>
                        {user.bio && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                                {user.bio}
                            </p>
                        )}
                    </div>
                </div>

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
                         shadow-sm"
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
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
                        📊 跳绳热力图
                    </h2>
                    <CalendarHeatmap
                        data={heatmapData}
                        startDate={new Date(startDate)}
                        endDate={new Date(endDate)}
                    />
                </div>

                {/* Charts */}
                <div className="mb-8">
                    <JumpCharts records={records} />
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-12 pb-4">
                    由蹦叽下生成的分享页面 · 每日跳绳记录
                </div>
            </main>
        </div>
    );
}
