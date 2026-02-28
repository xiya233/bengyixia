"use client";

import { useState, useTransition } from "react";
import { register, login } from "./actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthPageProps {
    siteTitle: string;
    siteDescription: string;
    registrationEnabled: boolean;
    announcements: Array<{
        id: number;
        title: string;
        content: string;
        createdAt: string;
    }>;
}

export function AuthPageClient({
    siteTitle,
    siteDescription,
    registrationEnabled,
    announcements,
}: AuthPageProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        const formData = new FormData(e.currentTarget);

        // Client-side confirm password check
        if (mode === "register") {
            const password = formData.get("password") as string;
            const confirmPassword = formData.get("confirmPassword") as string;
            if (password !== confirmPassword) {
                setError("两次输入的密码不一致");
                return;
            }
        }

        startTransition(async () => {
            const action = mode === "login" ? login : register;
            const result = await action(formData);
            if (result?.error) {
                setError(result.error);
            } else if (result?.success && mode === "register") {
                // Registration succeeded, switch to login
                setMode("login");
                setSuccessMsg("注册成功，请登录");
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            {/* Theme toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                                    bg-gradient-to-br from-emerald-400 to-cyan-500 
                                    shadow-lg shadow-emerald-500/25 mb-4">
                        <span className="text-2xl">🏃</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{siteTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{siteDescription}</p>
                </div>

                {/* Announcements */}
                {announcements.length > 0 && (
                    <div className="mb-6 space-y-3">
                        {announcements.slice(0, 3).map((a) => (
                            <div
                                key={a.id}
                                className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/40 
                                           rounded-xl px-4 py-3"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-sm mt-0.5">📢</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                            {a.title}
                                        </div>
                                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-2">
                                            {a.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Card */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60
                                shadow-xl shadow-gray-200/40 dark:shadow-black/20 p-8">
                    {/* Tab switch */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setError("");
                            }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "login"
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            登录
                        </button>
                        {registrationEnabled && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "register"
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                注册
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                用户名
                            </label>
                            <input
                                name="username"
                                type="text"
                                required
                                autoComplete="username"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                           focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                                           transition-all duration-200"
                                placeholder="请输入用户名"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                密码
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                           focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                                           transition-all duration-200"
                                placeholder={mode === "register" ? "至少 6 个字符" : "请输入密码"}
                            />
                        </div>

                        {mode === "register" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    确认密码
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                               focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                                               transition-all duration-200"
                                    placeholder="再次输入密码"
                                />
                            </div>
                        )}

                        {successMsg && (
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 
                                            px-3 py-2 rounded-lg animate-fade-in">
                                ✅ {successMsg}
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 
                                            px-3 py-2 rounded-lg animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                       hover:from-emerald-600 hover:to-cyan-600
                                       text-white font-medium rounded-xl text-sm
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200 
                                       shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30
                                       active:scale-[0.98]"
                        >
                            {isPending ? "处理中..." : mode === "login" ? "登录" : "注册"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                        {mode === "login"
                            ? "第一个注册的用户将成为管理员"
                            : "创建你的跳绳记录账号"}
                    </p>
                </div>
            </div>
        </div>
    );
}
