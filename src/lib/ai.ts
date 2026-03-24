import Anthropic from '@anthropic-ai/sdk'
import type { MarketData, AnomalyType } from './financial'
import type { RssItem } from './rss'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `你是「有理有財」理財知識平台的專業內容創作 AI。
- 語言：全繁體中文，不使用簡體字，專業術語可附英文對照
- 語氣：親切、客觀、專業但不艱澀，適合一般台灣讀者
- 嚴格禁止：推薦特定股票代號、基金買賣建議、保證獲利、賭博、非法集資、內線消息
- 所有文字皆為原創，不引用超過 10 字的原文連續片段
- 每篇結尾必須加入免責聲明：「本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。」`

export type GeneratedArticle = {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  wordCount: number
}

function buildSourceSummary(items: RssItem[]): string {
  return items
    .slice(0, 10)
    .map((item, i) => `${i + 1}. 標題：${item.title}\n   摘要：${item.summary}`)
    .join('\n\n')
}

export async function generateKnowledgeArticle(
  slot: 'afternoon' | 'evening',
  sources: RssItem[],
  avoidCategories: string[] = []
): Promise<GeneratedArticle> {
  const slotName = slot === 'afternoon' ? '午場（投資/ETF/基金/觀念）' : '晚場（保險/退休/節稅/省錢）'
  const avoidText = avoidCategories.length > 0
    ? `\n請避免使用以下已發布文章的主分類：${avoidCategories.join('、')}`
    : ''

  const sourceSummary = buildSourceSummary(sources)

  const prompt = `以下是今日財經媒體的標題與摘要素材（僅供參考方向，請勿直接引用原文）：

${sourceSummary}

請以這些素材為靈感方向，撰寫一篇約 2000 字的繁體中文深度理財知識文章，場次主題方向：${slotName}${avoidText}

文章格式：
- 標題（含 SEO 關鍵字）
- 引言（約 150 字）
- 主體段落（3–4 段，每段 400–500 字）
- 結語（約 150 字）
- 免責聲明（固定結尾）

請以 JSON 格式回覆，格式如下：
{
  "title": "文章標題",
  "content": "完整文章內容（Markdown 格式）",
  "summary": "150 字以內的文章摘要",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "category": "建議分類（投資入門/股票 & ETF/基金 & 債券/房地產/保險規劃/退休規劃/節稅 & 稅務/省錢 & 記帳）"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseGeneratedArticle(text)
}

export async function generatePredictionArticle(
  marketData: MarketData,
  newsItems: RssItem[],
  anomaly: AnomalyType = null
): Promise<GeneratedArticle> {
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Taipei',
  })

  const marketSummary = formatMarketData(marketData)
  const newsSummary = newsItems
    .slice(0, 5)
    .map((item) => `- ${item.title}`)
    .join('\n')

  const anomalyNote = anomaly
    ? `\n【重要】偵測到跨資產反常走勢（類型：${anomaly}），請在文章中加入「市場反直覺解析」段落，說明：(1)通常預期什麼走勢、(2)實際發生了什麼、(3)背後的機制是什麼。`
    : ''

  const prompt = `今日日期：${today}（台北時間）

今日盤前市場數據：
${marketSummary}

相關時事新聞標題：
${newsSummary}
${anomalyNote}

請撰寫一篇 800–1000 字的台股盤前預測分析文章，必須使用上述真實數字，預測結論使用模糊語氣（「可能」「傾向」「值得觀察」）。

文章結構：
1. 標題（含主要數字，如「那指昨漲 X%、台積電 ADR 漲 X%，今日台股大盤可能走勢」）
2. 引言（80–100 字，一句話帶出整體氛圍）
3. 美股回顧（200–250 字）
4. 時事影響因素（250–300 字）
5. 台股盤前研判（200–250 字）
6. 免責聲明：「本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。預測僅供參考，投資須自行判斷，作者及平台不負任何損益責任。」

請以 JSON 格式回覆：
{
  "title": "文章標題",
  "content": "完整文章內容（Markdown 格式）",
  "summary": "150 字以內的文章摘要",
  "tags": ["台股盤前", "那斯達克", "台積電", "大盤預測", "今日台股"],
  "category": "財經時事"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseGeneratedArticle(text)
}

export async function generateAnomalyAnalysisArticle(
  anomaly: AnomalyType,
  marketData: MarketData,
  newsItems: RssItem[]
): Promise<GeneratedArticle> {
  const marketSummary = formatMarketData(marketData)
  const newsSummary = newsItems.slice(0, 8).map((item) => `- ${item.title}`).join('\n')

  const prompt = `偵測到市場跨資產反常走勢（類型：${anomaly}）

市場數據：
${marketSummary}

相關新聞：
${newsSummary}

請撰寫一篇約 1500 字的「跨資產深度分析文」，詳細解構反常走勢背後的原因與機制。

文章必須包含：
1. 標題（點出反常現象）
2. 引言（說明為何此現象值得關注）
3. 反常現象描述（數字具體說明）
4. 傳統市場邏輯 vs 實際走勢（為何多數人感到意外）
5. 深度機制解析（至少 3 個面向：貨幣政策、市場結構、情緒面）
6. 對台股的潛在影響
7. 結語 + 強化版免責聲明

免責聲明必須包含：
「本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。本文分析屬事後歸因解讀，不代表未來走勢預測，各資產市場存在高度不確定性。想了解個人資產配置建議，請諮詢合格的理財規劃顧問。」

請以 JSON 格式回覆：
{
  "title": "文章標題",
  "content": "完整文章內容（Markdown 格式）",
  "summary": "150 字以內的文章摘要",
  "tags": ["跨資產分析", "市場異動", "深度解析"],
  "category": "財經時事"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseGeneratedArticle(text)
}

export function formatMarketData(data: MarketData): string {
  const s = (n: number, d = 2) => n.toFixed(d)
  const sign = (n: number) => (n >= 0 ? '+' : '')
  const lines: string[] = [`【數據抓取時間：${data.fetchedAt}】`]

  if (data.nasdaq) {
    lines.push(`• 那斯達克綜合指數：${data.nasdaq.value.toLocaleString()} 點，${sign(data.nasdaq.change)}${s(data.nasdaq.change)}（${sign(data.nasdaq.changePercent)}${s(data.nasdaq.changePercent)}%）  ← 數據時間：${data.nasdaq.time}`)
  }
  if (data.tsm) {
    lines.push(`• 台積電 ADR（TSM）：$${s(data.tsm.price)}，${sign(data.tsm.changePercent)}${s(data.tsm.changePercent)}%  ← 數據時間：${data.tsm.time}`)
  }
  if (data.twii) {
    lines.push(`• 台股加權指數（^TWII）：${data.twii.value.toLocaleString()} 點，${sign(data.twii.change)}${s(data.twii.change)}（${sign(data.twii.changePercent)}${s(data.twii.changePercent)}%）  ← 數據時間：${data.twii.time}`)
  }
  if (data.tsm2330) {
    lines.push(`• 台積電台股（2330）：${s(data.tsm2330.price, 0)} 元，${sign(data.tsm2330.changePercent)}${s(data.tsm2330.changePercent)}%  ← 數據時間：${data.tsm2330.time}`)
  }
  if (data.gold) {
    lines.push(`• 黃金期貨（GC=F）：$${s(data.gold.price)}/盎司，${sign(data.gold.changePercent)}${s(data.gold.changePercent)}%  ← 數據時間：${data.gold.time}`)
  }
  if (data.wti) {
    lines.push(`• WTI 原油期貨（CL=F）：$${s(data.wti.price)}/桶，${sign(data.wti.changePercent)}${s(data.wti.changePercent)}%  ← 數據時間：${data.wti.time}`)
  }
  if (data.silver) {
    lines.push(`• 白銀期貨（SI=F）：$${s(data.silver.price)}/盎司，${sign(data.silver.changePercent)}${s(data.silver.changePercent)}%  ← 數據時間：${data.silver.time}`)
  }
  if (data.vix) {
    lines.push(`• VIX 恐慌指數：${s(data.vix.value)}`)
  }

  lines.push('\n⚠️ 注意：文章中所有數字必須直接來自上方數據，嚴禁自行推算或捏造任何指數點位、價格或百分比。')
  return lines.join('\n')
}

function parseGeneratedArticle(text: string): GeneratedArticle {
  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON')

  const parsed = JSON.parse(jsonMatch[0])

  const wordCount = (parsed.content || '').replace(/\s/g, '').length

  return {
    title: parsed.title || '',
    content: parsed.content || '',
    summary: parsed.summary || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    category: parsed.category || '財經時事',
    wordCount,
  }
}
