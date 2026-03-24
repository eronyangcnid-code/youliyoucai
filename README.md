# 有理有財 — 理財知識文章管理系統

台灣繁體中文理財知識平台，每日三場自動化 AI 文章生成與管理系統。

## 技術架構

- **前端/後端**: Next.js 16 (App Router)
- **UI**: Tailwind CSS
- **資料庫**: PostgreSQL + Prisma ORM (v7)
- **AI**: Anthropic Claude API
- **認證**: NextAuth.js v5
- **部署**: Vercel + Railway/Render

## 快速開始

### 1. 環境設定

複製 `.env.local.example` 並填入你的設定：

```bash
cp .env.local .env.local
```

必填環境變數：
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/youliyoucai
NEXTAUTH_SECRET=your-random-secret
ANTHROPIC_API_KEY=your-claude-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 建立資料庫

先啟動 PostgreSQL，然後：

```bash
# 建立資料庫 schema
npm run db:push

# 建立初始資料（分類、來源、管理員帳號）
npm run db:seed
```

預設管理員帳號：
- Email: `admin@youliyoucai.tw`
- 密碼: `admin123`（**上線前請立即更改**）

### 4. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)

管理後台：[http://localhost:3000/admin](http://localhost:3000/admin)

## 功能說明

### 使用者端頁面

| 路由 | 說明 |
|------|------|
| `/` | 首頁：今日精選 + 最新文章 + 台股指數小工具 |
| `/prediction` | 今日台股預測文章專區 |
| `/category/:slug` | 分類文章列表 |
| `/article/:slug` | 文章詳細頁 |
| `/search?q=` | 全文搜尋 |
| `/tag/:tag` | 標籤文章列表 |
| `/about` | 關於我們 |

### 管理後台

| 路由 | 說明 |
|------|------|
| `/admin/dashboard` | 儀表板：排程狀態、待審核數、API 健康狀態 |
| `/admin/articles` | 文章管理：全部文章列表、狀態篩選 |
| `/admin/review` | 審核佇列：側邊預覽 + 通過/退回 |
| `/admin/schedule` | 排程管理：手動觸發三場排程 |
| `/admin/sources` | 資料來源管理：連線測試 |
| `/admin/logs` | 排程紀錄 |
| `/admin/settings` | 系統設定：審核模式、免責聲明 |

## 自動排程設定

使用 GitHub Actions 定時觸發文章生成：

1. 在 GitHub repo Settings > Secrets 加入：
   - `SITE_URL`: 你的網站 URL
   - `SCHEDULE_SECRET`: 自定義的秘密金鑰

2. `.github/workflows/schedule.yml` 已設定三場 Cron 時間

## 文章生成流程

1. **早場 (05:30)**: 取得那斯達克、TSM、黃金、石油 API 數據 + RSS 新聞
   - 偵測跨資產反常走勢
   - AI 生成台股盤前預測文章（800-1000字）
   - 如有嚴重異常，午場額外生成跨資產深度分析文

2. **午場 (13:30)**: 取得多家財經媒體 RSS
   - AI 生成深度理財知識文（約2000字）
   - 主題去重（避開近7日已發布主分類）

3. **晚場 (19:30)**: 取得生活理財相關 RSS
   - AI 生成生活理財文章（約2000字）

每篇文章生成後自動進行：
- N-gram 相似度檢查（>30% 標黃色警告，>50% 自動退回）
- 字數檢查（不足自動補充）
- 禁用詞偵測

## API Keys 取得

| 服務 | 用途 | 免費方案 |
|------|------|---------|
| [Anthropic](https://anthropic.com) | AI 文章生成 | 依使用量計費 |
| [Alpha Vantage](https://alphavantage.co) | 美股/商品行情 | 25次/天免費 |
| [TWSE Open API](https://openapi.twse.com.tw) | 台股指數 | 完全免費 |
