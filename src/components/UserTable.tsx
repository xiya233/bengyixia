"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface UserRow {
    id: number;
    username: string;
    avatar: string | null;
    bio: string | null;
    role: string;
    status: string;
    createdAt: string;
}

interface UserTableProps {
    users: UserRow[];
    currentUserId: number;
    onBan: (userId: number) => Promise<{ error?: string; success?: boolean }>;
    onUnban: (userId: number) => Promise<{ error?: string; success?: boolean }>;
    onDelete: (userId: number) => Promise<{ error?: string; success?: boolean }>;
}

export function UserTable({ users, currentUserId, onBan, onUnban, onDelete }: UserTableProps) {
    const [isPending, startTransition] = useTransition();
    const [actionUser, setActionUser] = useState<number | null>(null);
    const router = useRouter();

    const handleAction = (userId: number, action: () => Promise<{ error?: string; success?: boolean }>) => {
        setActionUser(userId);
        startTransition(async () => {
            await action();
            setActionUser(null);
            router.refresh();
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">用户</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">角色</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">注册时间</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                                        {user.bio && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{user.bio}</div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        }`}
                                >
                                    {user.role === "admin" ? "管理员" : "普通用户"}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "active"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                        }`}
                                >
                                    {user.status === "active" ? "正常" : "已封禁"}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                                {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                            </td>
                            <td className="py-3 px-4 text-right">
                                {user.id !== currentUserId && user.role !== "admin" && (
                                    <div className="flex items-center justify-end gap-2">
                                        {user.status === "active" ? (
                                            <button
                                                onClick={() => handleAction(user.id, () => onBan(user.id))}
                                                disabled={isPending && actionUser === user.id}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                                   bg-amber-50 text-amber-600 hover:bg-amber-100
                                   dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40
                                   transition-colors disabled:opacity-50"
                                            >
                                                封禁
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAction(user.id, () => onUnban(user.id))}
                                                disabled={isPending && actionUser === user.id}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                                   bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                                   dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40
                                   transition-colors disabled:opacity-50"
                                            >
                                                解封
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
                                                    handleAction(user.id, () => onDelete(user.id));
                                                }
                                            }}
                                            disabled={isPending && actionUser === user.id}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg
                                 bg-red-50 text-red-600 hover:bg-red-100
                                 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40
                                 transition-colors disabled:opacity-50"
                                        >
                                            删除
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
