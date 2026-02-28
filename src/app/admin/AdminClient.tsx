"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserTable } from "@/components/UserTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { banUser, unbanUser, deleteUser, createUser } from "@/app/actions/admin";
import { updateSiteSetting, createAnnouncement, deleteAnnouncement } from "@/app/actions/settings";
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
    initialSettings: Record<string, string>;
    initialAnnouncements: Array<{
        id: number;
        title: string;
        content: string;
        createdAt: string;
    }>;
}

type Tab = "users" | "settings" | "announcements";

export function AdminClient({ currentUser, users, initialSettings, initialAnnouncements }: AdminClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("users");
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Settings state
    const [settings, setSettings] = useState(initialSettings);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);

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

    const handleUpdateSetting = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        startTransition(async () => {
            const result = await updateSiteSetting(key, value);
            if (result.success) {
                setSuccess("设置已保存");
                setTimeout(() => setSuccess(""), 2000);
            }
        });
    };

    const handleCreateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createAnnouncement(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("公告已发布");
                router.refresh();
                setTimeout(() => setSuccess(""), 2000);
                // Refresh announcements
                const form = e.target as HTMLFormElement;
                form.reset();
                // Re-fetch
                window.location.reload();
            }
        });
    };

    const handleDeleteAnnouncement = (id: number) => {
        startTransition(async () => {
            await deleteAnnouncement(id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            setSuccess("公告已删除");
            setTimeout(() => setSuccess(""), 2000);
        });
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "users", label: "用户管理", icon: "👥" },
        { key: "settings", label: "网站设置", icon: "⚙️" },
        { key: "announcements", label: "公告管理", icon: "📢" },
    ];

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
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">管理面板</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {activeTab === "users" && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-4 py-2 text-sm font-medium rounded-xl
                             bg-emerald-600 text-white hover:bg-emerald-700
                             transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                + 添加用户
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.key
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

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

                {/* ===== Users Tab ===== */}
                {activeTab === "users" && (
                    <>
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
                    </>
                )}

                {/* ===== Settings Tab ===== */}
                {activeTab === "settings" && (
                    <div className="space-y-6">
                        {/* Registration Toggle */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                🔐 用户注册
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                控制是否允许新用户注册。关闭后，只有管理员可以添加用户。
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleUpdateSetting("registration_enabled", settings.registration_enabled === "true" ? "false" : "true")}
                                    disabled={isPending}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${settings.registration_enabled === "true"
                                        ? "bg-emerald-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${settings.registration_enabled === "true" ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {settings.registration_enabled === "true" ? "允许注册" : "已关闭注册"}
                                </span>
                            </div>
                        </div>

                        {/* Captcha Toggle */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                🔢 验证码
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                登录和注册时是否要求用户输入数学验证码。
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleUpdateSetting("captcha_enabled", settings.captcha_enabled === "true" ? "false" : "true")}
                                    disabled={isPending}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${settings.captcha_enabled !== "false"
                                            ? "bg-emerald-500"
                                            : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${settings.captcha_enabled !== "false" ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {settings.captcha_enabled !== "false" ? "已启用验证码" : "已关闭验证码"}
                                </span>
                            </div>
                        </div>
                        {/* Site Title & Description */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                🌐 网站信息
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        网站标题
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.site_title || ""}
                                        onChange={(e) => setSettings((prev) => ({ ...prev, site_title: e.target.value }))}
                                        onBlur={(e) => handleUpdateSetting("site_title", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                   transition-all duration-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        网站描述
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.site_description || ""}
                                        onChange={(e) => setSettings((prev) => ({ ...prev, site_description: e.target.value }))}
                                        onBlur={(e) => handleUpdateSetting("site_description", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                   transition-all duration-200 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Avatar Size */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                🖼️ 头像设置
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                设置用户上传头像的最大文件大小。
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={settings.max_avatar_size_mb || "5"}
                                    onChange={(e) => setSettings((prev) => ({ ...prev, max_avatar_size_mb: e.target.value }))}
                                    onBlur={(e) => handleUpdateSetting("max_avatar_size_mb", e.target.value)}
                                    className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                               transition-all duration-200 text-sm text-center"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">MB</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== Announcements Tab ===== */}
                {activeTab === "announcements" && (
                    <div className="space-y-6">
                        {/* Create Announcement */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                ✏️ 发布公告
                            </h3>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        标题
                                    </label>
                                    <input
                                        name="title"
                                        type="text"
                                        required
                                        maxLength={100}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                   transition-all duration-200 text-sm"
                                        placeholder="公告标题"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        内容
                                    </label>
                                    <textarea
                                        name="content"
                                        required
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                   transition-all duration-200 text-sm resize-none"
                                        placeholder="公告内容"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 
                             text-white font-medium rounded-xl text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {isPending ? "发布中..." : "发布公告"}
                                </button>
                            </form>
                        </div>

                        {/* Announcements List */}
                        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                                border border-gray-200/60 dark:border-gray-800/60 p-6
                                shadow-sm animate-fade-in">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                                📋 公告列表
                            </h3>
                            {announcements.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                    暂无公告
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {announcements.map((a) => (
                                        <div
                                            key={a.id}
                                            className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-900 dark:text-white">
                                                    {a.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {a.content}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {new Date(a.createdAt).toLocaleDateString("zh-CN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(a.id)}
                                                disabled={isPending}
                                                className="ml-4 px-3 py-1.5 text-xs font-medium rounded-lg
                                         text-red-500 hover:text-red-700 hover:bg-red-50
                                         dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20
                                         transition-colors disabled:opacity-50"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
