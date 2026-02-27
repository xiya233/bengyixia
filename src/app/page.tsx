"use client";

import { useState, useTransition } from "react";
import { register, login } from "./actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = mode === "login" ? login : register;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Theme toggle in top right */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">蹦叽下</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">每日跳绳记录</p>
        </div>

        {/* Card */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl 
                        border border-gray-200/60 dark:border-gray-800/60
                        shadow-xl shadow-gray-200/40 dark:shadow-black/20 p-8">
          {/* Tab switch */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "login"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === "register"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              注册
            </button>
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
            {mode === "login" ? "第一个注册的用户将成为管理员" : "创建你的跳绳记录账号"}
          </p>
        </div>
      </div>
    </div>
  );
}
