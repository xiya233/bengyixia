import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "蹦叽下 - 每日跳绳记录",
  description: "记录每天的跳绳数据，追踪你的运动进度",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {/* Grid Background */}
          <div className="fixed inset-0 -z-10 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div
              className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-gray-950/80" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
