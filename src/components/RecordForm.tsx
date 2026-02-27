"use client";

import { useState, useTransition } from "react";

interface RecordFormProps {
    onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
    initialDate?: string;
}

export function RecordForm({ onSubmit, initialDate }: RecordFormProps) {
    const [date, setDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
    const [count, setCount] = useState("");
    const [duration, setDuration] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.set("date", date);
        formData.set("count", count);
        if (duration) formData.set("duration", duration);

        startTransition(async () => {
            const result = await onSubmit(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setCount("");
                setDuration("");
                setTimeout(() => setSuccess(false), 2000);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        📅 日期
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                       transition-all duration-200 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        🏃 跳绳次数
                    </label>
                    <input
                        type="number"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        placeholder="例如：1500"
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       transition-all duration-200 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        ⏱️ 时长（分钟）
                    </label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="可选"
                        min="0"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       transition-all duration-200 text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 
                     text-white font-medium rounded-xl text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 
                     shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    {isPending ? "保存中..." : "💾 保存记录"}
                </button>

                {error && (
                    <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
                )}
                {success && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
                        ✅ 保存成功!
                    </span>
                )}
            </div>
        </form>
    );
}
