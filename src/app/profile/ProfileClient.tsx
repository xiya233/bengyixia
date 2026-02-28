"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile, uploadAvatar, changePassword } from "@/app/actions/user";
import { toggleShare } from "@/app/actions/share";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
    user: {
        id: number;
        username: string;
        avatar: string | null;
        bio: string | null;
        role: string;
        shareToken: string | null;
        createdAt: string;
    };
}

export function ProfileClient({ user }: ProfileClientProps) {
    const [bio, setBio] = useState(user.bio || "");
    const [avatar, setAvatar] = useState(user.avatar);
    const [shareToken, setShareToken] = useState(user.shareToken);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [widgetCopied, setWidgetCopied] = useState(false);
    const [widgetTypes, setWidgetTypes] = useState<Record<string, boolean>>({
        heatmap: true,
        line: false,
        bar: false,
    });
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [pwMsg, setPwMsg] = useState("");
    const [pwError, setPwError] = useState("");

    const shareUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}` : '';

    const handleToggleShare = () => {
        startTransition(async () => {
            const result = await toggleShare();
            if (result.error) {
                setError(result.error);
            } else {
                setShareToken(result.shareToken ?? null);
                setMessage(result.shareToken ? "分享已开启" : "分享已关闭");
                setTimeout(() => setMessage(""), 2000);
            }
        });
    };

    const handleCopyUrl = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleWidgetType = (type: string) => {
        setWidgetTypes((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const getEmbedCode = () => {
        if (!shareToken) return '';
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const selected = Object.entries(widgetTypes).filter(([, v]) => v).map(([k]) => k);
        if (selected.length === 0) return '<!-- 请至少选择一种图表类型 -->';

        const iframes = selected.map((type) => {
            const labels: Record<string, string> = { heatmap: '跳绳热力图', line: '跳绳趋势', bar: '每日时长' };
            const heights: Record<string, number> = { heatmap: 220, line: 260, bar: 260 };
            return `<!-- ${labels[type]} -->
<iframe src="${baseUrl}/embed/${shareToken}?type=${type}" width="100%" height="${heights[type]}" style="border:none;border-radius:12px;overflow:hidden;" loading="lazy"></iframe>`;
        });
        return iframes.join('\n\n');
    };

    const handleCopyWidget = async () => {
        const code = getEmbedCode();
        if (!code) return;
        await navigator.clipboard.writeText(code);
        setWidgetCopied(true);
        setTimeout(() => setWidgetCopied(false), 2000);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setMessage("");

        const formData = new FormData();
        formData.set("avatar", file);

        startTransition(async () => {
            const result = await uploadAvatar(formData);
            if (result.error) {
                setError(result.error);
            } else if (result.avatar) {
                setAvatar(result.avatar);
                setMessage("头像更新成功");
                router.refresh();
                setTimeout(() => setMessage(""), 2000);
            }
        });
    };

    const handleSaveBio = () => {
        setError("");
        setMessage("");

        const formData = new FormData();
        formData.set("bio", bio);

        startTransition(async () => {
            const result = await updateProfile(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setMessage("资料更新成功");
                setTimeout(() => setMessage(""), 2000);
            }
        });
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">个人资料</h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-8
                        shadow-sm animate-slide-up">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 
                          flex items-center justify-center text-white text-2xl font-bold
                          overflow-hidden cursor-pointer hover:ring-4 hover:ring-emerald-500/30 
                          transition-all duration-200 shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatar ? (
                                <img src={avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                user.username[0].toUpperCase()
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            更换头像
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3">{user.username}</h2>
                        <span
                            className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                }`}
                        >
                            {user.role === "admin" ? "管理员" : "普通用户"}
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                个人简介
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                maxLength={200}
                                placeholder="介绍一下你自己..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           transition-all duration-200 resize-none text-sm"
                            />
                            <div className="text-xs text-gray-400 mt-1 text-right">{bio.length}/200</div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveBio}
                                disabled={isPending}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 
                           text-white font-medium rounded-xl text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                {isPending ? "保存中..." : "保存资料"}
                            </button>

                            {message && (
                                <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
                                    ✅ {message}
                                </span>
                            )}
                            {error && (
                                <span className="text-sm text-red-500 dark:text-red-400 animate-fade-in">
                                    ❌ {error}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                            注册时间：{new Date(user.createdAt).toLocaleDateString("zh-CN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-8 mt-6
                        shadow-sm animate-slide-up">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        🔑 修改密码
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPwMsg("");
                            setPwError("");
                            const formData = new FormData(e.currentTarget);
                            startTransition(async () => {
                                const result = await changePassword(formData);
                                if (result?.error) {
                                    setPwError(result.error);
                                } else {
                                    setPwMsg("密码修改成功");
                                    (e.target as HTMLFormElement).reset();
                                }
                            });
                        }}
                        className="space-y-4 max-w-md"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                旧密码
                            </label>
                            <input
                                name="oldPassword"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                           focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                                           transition-all duration-200"
                                placeholder="请输入当前密码"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                新密码
                            </label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                           focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                                           transition-all duration-200"
                                placeholder="至少 6 个字符"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                确认新密码
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
                                placeholder="再次输入新密码"
                            />
                        </div>

                        {pwError && (
                            <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                {pwError}
                            </div>
                        )}
                        {pwMsg && (
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                                ✅ {pwMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                       hover:from-emerald-600 hover:to-cyan-600
                                       text-white font-medium rounded-xl text-sm
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200 shadow-md shadow-emerald-500/25
                                       active:scale-[0.98]"
                        >
                            {isPending ? "处理中..." : "修改密码"}
                        </button>
                    </form>
                </div>

                {/* Share Section */}
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60 p-8 mt-6
                        shadow-sm animate-slide-up">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        🔗 分享运动数据
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        开启分享后，其他人可以通过专属链接查看你的运动数据。
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggleShare}
                            disabled={isPending}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${shareToken
                                ? 'bg-emerald-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${shareToken ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {shareToken ? '分享已开启' : '分享已关闭'}
                        </span>
                    </div>

                    {shareToken && (
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                                    bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs
                                    select-all truncate"
                            />
                            <button
                                onClick={handleCopyUrl}
                                className="px-4 py-2 text-xs font-medium rounded-lg
                                    bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                                    dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40
                                    transition-colors whitespace-nowrap"
                            >
                                {copied ? '✅ 已复制' : '📋 复制链接'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Widget Embed Section */}
                {shareToken && (
                    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl 
                            border border-gray-200/60 dark:border-gray-800/60 p-8 mt-6
                            shadow-sm animate-slide-up">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                            🧩 小挂件
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            将跳绳记录嵌入到你的个人博客或网站中。
                        </p>

                        {/* Chart Type Selection */}
                        <div className="flex flex-wrap gap-3 mb-5">
                            {[
                                { key: 'heatmap', label: '🔥 热力图', desc: '年度运动热力' },
                                { key: 'line', label: '📈 折线图', desc: '跳绳次数趋势' },
                                { key: 'bar', label: '📊 柱状图', desc: '每日运动时长' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleWidgetType(item.key)}
                                    className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${widgetTypes[item.key]
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {item.desc}
                                    </div>
                                    {widgetTypes[item.key] && (
                                        <div className="text-emerald-500 text-xs mt-1">✓ 已选择</div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Embed Code Preview */}
                        <div className="relative">
                            <pre className="bg-gray-900 text-gray-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                                <code>{getEmbedCode()}</code>
                            </pre>
                            <button
                                onClick={handleCopyWidget}
                                className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg
                                    bg-white/10 text-white hover:bg-white/20
                                    transition-colors whitespace-nowrap"
                            >
                                {widgetCopied ? '✅ 已复制' : '📋 复制代码'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
