import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'YouLiYouCai RSS Reader/1.0',
  },
})

export type RssItem = {
  title: string
  summary: string
  link: string
  pubDate?: string
  categories?: string[]
}

export async function fetchRssFeed(url: string, maxItems = 10): Promise<RssItem[]> {
  const feed = await parser.parseURL(url)
  return (feed.items || []).slice(0, maxItems).map((item) => ({
    title: item.title || '',
    summary: truncate(item.contentSnippet || item.summary || item.content || '', 200),
    link: item.link || '',
    pubDate: item.pubDate,
    categories: item.categories,
  }))
}

function truncate(text: string, maxChars: number): string {
  const cleaned = text.replace(/<[^>]+>/g, '').trim()
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars) + '...' : cleaned
}

export const RSS_SOURCES: Record<string, { name: string; url: string; slots: string[] }> = {
  cnyes: {
    name: '鉅亨網',
    url: 'https://rssnews.cnyes.com/news/id/headline',
    slots: ['afternoon', 'evening'],
  },
  moneydj: {
    name: 'MoneyDJ 理財網',
    url: 'https://www.moneydj.com/rss/news.aspx',
    slots: ['afternoon', 'evening'],
  },
  smart: {
    name: 'Smart 智富',
    url: 'https://www.businessweekly.com.tw/rss/RssFeed.aspx?channelid=11',
    slots: ['afternoon', 'evening'],
  },
  businesstoday: {
    name: '今周刊',
    url: 'https://www.businesstoday.com.tw/rss',
    slots: ['afternoon', 'evening'],
  },
  money101: {
    name: 'Money 錢雜誌',
    url: 'https://www.money101.com.tw/rss',
    slots: ['evening'],
  },
  ltn_ec: {
    name: '自由財經',
    url: 'https://ec.ltn.com.tw/rss/finance.xml',
    slots: ['morning', 'afternoon'],
  },
  ettoday: {
    name: 'ETtoday 財經',
    url: 'https://feeds.feedburner.com/ettoday/finance',
    slots: ['morning'],
  },
  udn: {
    name: '聯合報財經',
    url: 'https://udn.com/rssfeed/news/2/6638',
    slots: ['afternoon'],
  },
  chinatimes: {
    name: '中時財經',
    url: 'https://www.chinatimes.com/rss/money.xml',
    slots: ['afternoon'],
  },
  stockfeel: {
    name: '股感 StockFeel',
    url: 'https://www.stockfeel.com.tw/feed/',
    slots: ['afternoon'],
  },
  fsc: {
    name: '金管會',
    url: 'https://www.fsc.gov.tw/ch/home.jsp?id=97&parentpath=0,2&mcustomize=news_rss.jsp',
    slots: ['evening'],
  },
  mof: {
    name: '財政部',
    url: 'https://www.mof.gov.tw/mofpublish/NewsRss',
    slots: ['evening'],
  },
  mrmarket: {
    name: 'Mr. Market 市場先生',
    url: 'https://rich01.com/feed/',
    slots: ['afternoon', 'evening'],
  },
  my83: {
    name: '好險網',
    url: 'https://my83.com.tw/feed',
    slots: ['evening'],
  },
  investopedia: {
    name: 'Investopedia',
    url: 'https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline',
    slots: ['afternoon'],
  },
}
