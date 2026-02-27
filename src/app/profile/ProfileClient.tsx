"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile, uploadAvatar } from "@/app/actions/user";
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
        createdAt: string;
    };
}

export function ProfileClient({ user }: ProfileClientProps) {
    const [bio, setBio] = useState(user.bio || "");
    const [avatar, setAvatar] = useState(user.avatar);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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
            </main>
        </div>
    );
}
