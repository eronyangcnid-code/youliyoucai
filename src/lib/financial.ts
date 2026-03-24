import axios from 'axios'

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const TWSE_BASE = 'https://openapi.twse.com.tw/v1'

export type MarketData = {
  nasdaq?: { value: number; change: number; changePercent: number; time: string }
  tsm?: { price: number; change: number; changePercent: number; time: string }
  tsm2330?: { price: number; change: number; changePercent: number; time: string }
  gold?: { price: number; change: number; changePercent: number; time: string }
  wti?: { price: number; change: number; changePercent: number; time: string }
  silver?: { price: number; change: number; changePercent: number; time: string }
  twii?: { value: number; change: number; changePercent: number; time: string }
  vix?: { value: number }
  fetchedAt: string
}

async function yahooQuote(symbol: string) {
  const url = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=2d`
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  })
  const meta = res.data?.chart?.result?.[0]?.meta
  if (!meta || !meta.regularMarketPrice) return null

  const price = meta.regularMarketPrice as number
  const prev = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number
  const change = price - prev
  const changePercent = prev !== 0 ? (change / prev) * 100 : 0
  const time = new Date(meta.regularMarketTime * 1000).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  return { price, change, changePercent, time }
}

export async function fetchAllMarketData(): Promise<MarketData> {
  const [nasdaqRaw, tsmRaw, twiiRaw, goldRaw, wtiRaw, silverRaw, tsm2330Raw] =
    await Promise.allSettled([
      yahooQuote('^IXIC'),    // NASDAQ Composite
      yahooQuote('TSM'),      // 台積電 ADR
      yahooQuote('^TWII'),    // 台股加權指數
      yahooQuote('GC=F'),     // 黃金期貨
      yahooQuote('CL=F'),     // WTI 原油期貨
      yahooQuote('SI=F'),     // 白銀期貨
      yahooQuote('2330.TW'),  // 台積電台股
    ])

  function ok<T>(r: PromiseSettledResult<T | null>): T | undefined {
    return r.status === 'fulfilled' && r.value != null ? r.value : undefined
  }

  const nasdaq = ok(nasdaqRaw)
  const tsm = ok(tsmRaw)
  const twii = ok(twiiRaw)
  const gold = ok(goldRaw)
  const wti = ok(wtiRaw)
  const silver = ok(silverRaw)
  const tsm2330 = ok(tsm2330Raw)

  return {
    nasdaq: nasdaq ? { value: nasdaq.price, change: nasdaq.change, changePercent: nasdaq.changePercent, time: nasdaq.time } : undefined,
    tsm: tsm ? { price: tsm.price, change: tsm.change, changePercent: tsm.changePercent, time: tsm.time } : undefined,
    twii: twii ? { value: twii.price, change: twii.change, changePercent: twii.changePercent, time: twii.time } : undefined,
    gold: gold ? { price: gold.price, change: gold.change, changePercent: gold.changePercent, time: gold.time } : undefined,
    wti: wti ? { price: wti.price, change: wti.change, changePercent: wti.changePercent, time: wti.time } : undefined,
    silver: silver ? { price: silver.price, change: silver.change, changePercent: silver.changePercent, time: silver.time } : undefined,
    tsm2330: tsm2330 ? { price: tsm2330.price, change: tsm2330.change, changePercent: tsm2330.changePercent, time: tsm2330.time } : undefined,
    fetchedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
  }
}

export async function fetchTWSEData() {
  // 使用 Yahoo Finance ^TWII（TWSE Open API 欄位不穩定）
  const data = await yahooQuote('^TWII')
  if (!data) return null
  return { price: data.price, change: data.change, changePercent: data.changePercent }
}

export type AnomalyType =
  | 'oil_up_gold_down'
  | 'oil_up_silver_down_more'
  | 'war_gold_down'
  | 'gold_up_nasdaq_up'
  | 'nasdaq_up_taiwan_down'
  | null

export function detectMarketAnomaly(data: MarketData, warKeywordDetected = false): AnomalyType {
  const { wti, gold, silver, nasdaq, twii } = data

  if (wti && gold && wti.changePercent > 3 && gold.changePercent < -1) return 'oil_up_gold_down'
  if (wti && silver && wti.changePercent > 3 && silver.changePercent < -3) return 'oil_up_silver_down_more'
  if (warKeywordDetected && gold && gold.changePercent < -2) return 'war_gold_down'
  if (gold && nasdaq && gold.changePercent > 3 && nasdaq.changePercent > 1) return 'gold_up_nasdaq_up'
  if (nasdaq && twii && nasdaq.changePercent > 2 && twii.changePercent < -1) return 'nasdaq_up_taiwan_down'
  return null
}
