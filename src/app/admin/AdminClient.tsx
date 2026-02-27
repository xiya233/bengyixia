"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserTable } from "@/components/UserTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { banUser, unbanUser, deleteUser, createUser } from "@/app/actions/admin";
import Link from "next/link";

interface AdminClientProps {
    currentUser: { id: number; username: string };
    users: Array<{
        id: number;
        username: string;
        avatar: string | null;
        bio: string | null;
        role: string;
        status: string;
        createdAt: string;
    }>;
}

export function AdminClient({ currentUser, users }: AdminClientProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createUser(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("用户创建成功");
                setShowAddForm(false);
                router.refresh();
                setTimeout(() => setSuccess(""), 2000);
            }
        });
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">用户管理</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 text-sm font-medium rounded-xl
                         bg-emerald-600 text-white hover:bg-emerald-700
                         transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            + 添加用户
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Add User Form */}
                {showAddForm && (
                    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                          border border-gray-200/60 dark:border-gray-800/60 p-6 mb-6
                          shadow-sm animate-slide-up">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">添加新用户</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        用户名
                                    </label>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                               transition-all duration-200 text-sm"
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
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                               transition-all duration-200 text-sm"
                                        placeholder="至少 6 个字符"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        角色
                                    </label>
                                    <select
                                        name="role"
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                               transition-all duration-200 text-sm"
                                    >
                                        <option value="user">普通用户</option>
                                        <option value="admin">管理员</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 
                             text-white font-medium rounded-xl text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {isPending ? "创建中..." : "创建用户"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-6 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-700 
                             hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
                             transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Messages */}
                {error && (
                    <div className="mb-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 
                          px-4 py-3 rounded-xl animate-fade-in">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 
                          px-4 py-3 rounded-xl animate-fade-in">
                        ✅ {success}
                    </div>
                )}

                {/* User Table */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-6
                        shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            所有用户 ({users.length})
                        </h2>
                    </div>
                    <UserTable
                        users={users}
                        currentUserId={currentUser.id}
                        onBan={banUser}
                        onUnban={unbanUser}
                        onDelete={deleteUser}
                    />
                </div>
            </main>
        </div>
    );
}
