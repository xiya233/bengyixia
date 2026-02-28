# 🏃 蹦叽下 - 每日跳绳记录

一个简洁优雅的每日跳绳记录 Web 应用，帮助你追踪和可视化自己的跳绳运动数据。

## ✨ 功能特性

### 📊 数据记录与可视化
- **热力图**：GitHub 风格的年度跳绳热力图，直观展示运动频率
- **折线图**：按月展示跳绳次数趋势变化
- **柱状图**：按月对比跳绳数据
- **日期筛选**：支持按年份、自定义日期范围查看数据

### 👤 用户系统
- **注册 / 登录**：支持用户注册和登录，数学验证码防护
- **个人资料**：自定义头像、个人简介
- **密码修改**：支持修改登录密码（需验证旧密码）
- **角色管理**：第一个注册的用户自动成为管理员

### 🔗 数据分享
- **分享页面**：生成 UUID 风格的链接，分享你的运动数据
- **可嵌入小挂件**：生成嵌入代码，将热力图/折线图/柱状图展示在个人博客
- **主题跟随**：分享页面遵循用户选择的浅色/深色主题

### 🛠️ 管理面板
- **用户管理**：查看、封禁、解封、删除用户，手动添加新用户
- **网站设置**：
  - 启用/关闭用户注册
  - 启用/关闭验证码
  - 自定义网站标题和描述
  - 设置用户头像上传大小限制（1-20MB）
- **公告管理**：发布和删除公告，公告显示在首页

## 🧱 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | [Next.js](https://nextjs.org/) 16 (App Router, Server Actions) |
| **语言** | TypeScript |
| **运行时** | [Bun](https://bun.sh/) |
| **前端** | React 19, Tailwind CSS 4 |
| **UI 组件** | [shadcn/ui](https://ui.shadcn.com/), Radix UI, Lucide Icons |
| **图表** | [Recharts](https://recharts.org/) |
| **数据库** | SQLite（通过 [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)） |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **认证** | JWT（[jose](https://github.com/panva/jose)）+ bcryptjs 密码哈希 |
| **图片处理** | [sharp](https://sharp.pixelplumbing.com/)（头像裁剪压缩） |

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── actions/            # Server Actions
│   │   ├── auth.ts         # 注册、登录、登出
│   │   ├── records.ts      # 跳绳记录 CRUD
│   │   ├── settings.ts     # 站点设置、公告管理
│   │   ├── share.ts        # 分享功能
│   │   └── user.ts         # 个人资料、头像上传、密码修改
│   ├── admin/              # 管理面板
│   ├── api/captcha/        # 验证码 API
│   ├── dashboard/          # 仪表盘
│   ├── embed/[token]/      # 可嵌入小挂件
│   ├── profile/            # 个人资料
│   └── share/[token]/      # 分享页面
├── components/             # React 组件
│   ├── CalendarHeatmap.tsx  # 热力图
│   ├── JumpCharts.tsx      # 折线图 & 柱状图
│   ├── RecordForm.tsx      # 记录表单
│   └── ThemeToggle.tsx     # 主题切换
├── db/                     # 数据库
│   ├── index.ts            # 连接 & 初始化
│   └── schema.ts           # Drizzle Schema
├── lib/                    # 工具库
│   ├── auth.ts             # 认证
│   ├── captcha.ts          # 验证码生成 & 验证
│   └── utils.ts            # 通用工具
└── middleware.ts            # 路由中间件
```

## 🚀 部署指南

### 环境变量

创建 `.env` 文件（可选，有默认值）：

```env
# JWT 签名密钥（生产环境强烈建议修改）
JWT_SECRET=your-super-secure-random-key-here

# 验证码签名密钥（生产环境强烈建议修改）
CAPTCHA_SECRET=your-captcha-secret-key-here

# 端口（默认 3000）
PORT=3000
```

> **⚠️ 安全提示**：生产环境务必设置自定义的 `JWT_SECRET` 和 `CAPTCHA_SECRET`，不要使用默认值。

---

### 方式一：手动部署

#### 前置要求

- [Bun](https://bun.sh/) >= 1.0（推荐）或 [Node.js](https://nodejs.org/) >= 18
- Git

#### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-username/bengyixia.git
cd bengyixia

# 2. 安装依赖
bun install

# 3. 构建项目
bun run build

# 4. 启动服务
bun run start
```

应用默认运行在 `http://localhost:3000`。

#### 使用 PM2 守护进程（推荐）

```bash
# 安装 PM2
bun add -g pm2

# 启动应用
pm2 start bun --name bengyixia -- run start

# 设置开机自启
pm2 save
pm2 startup
```

#### 使用 systemd 守护进程

创建 `/etc/systemd/system/bengyixia.service`：

```ini
[Unit]
Description=Bengyixia Jump Rope Tracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/bengyixia
Environment=NODE_ENV=production
Environment=JWT_SECRET=your-secret-here
ExecStart=/usr/local/bin/bun run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bengyixia
```

#### 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 方式二：Docker Compose 部署

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# 安装依赖
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 数据持久化目录
RUN mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
```

> **注意**：Docker 构建使用 `standalone` 输出模式，需要在 `next.config.ts` 中添加：
> ```ts
> output: "standalone",
> ```

#### 2. 创建 docker-compose.yml

```yaml
services:
  bengyixia:
    build: .
    container_name: bengyixia
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-super-secure-random-key-here
      - CAPTCHA_SECRET=your-captcha-secret-key-here
    volumes:
      - ./data:/app/data          # SQLite 数据库持久化
      - ./uploads:/app/public/uploads  # 用户头像持久化
```

#### 3. 启动

```bash
# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f bengyixia

# 停止
docker compose down
```

#### 4. 配合 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📝 数据存储

- **数据库**：SQLite 文件存储在 `data/` 目录，首次启动自动创建和初始化
- **头像文件**：存储在 `public/uploads/` 目录
- **备份**：只需备份 `data/` 和 `public/uploads/` 目录即可

## 🎨 主题

支持浅色和深色两种主题，通过页面右上角的按钮切换，偏好设置存储在浏览器本地。

## 📄 许可证

MIT License
