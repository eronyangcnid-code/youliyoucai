import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create super admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@youliyoucai.tw' },
    update: {},
    create: {
      email: 'admin@youliyoucai.tw',
      name: '超級管理者',
      password: hashedPassword,
      role: 'super_admin',
    },
  })
  console.log('Created admin user: admin@youliyoucai.tw / admin123')

  // Create categories
  const categories = [
    { name: '財經時事', slug: 'financial-news', description: '每日台股盤前預測、市場動態快報', slot: 'morning' },
    { name: '投資入門', slug: 'investment-basics', description: '適合新手的基礎投資觀念、常見誤區', slot: 'afternoon' },
    { name: '股票 & ETF', slug: 'stocks-etf', description: 'ETF策略、指數投資、存股觀念', slot: 'afternoon' },
    { name: '基金 & 債券', slug: 'funds-bonds', description: '共同基金、資產配置、債券投資', slot: 'afternoon' },
    { name: '房地產', slug: 'real-estate', description: '買房、房貸、不動產投資', slot: null },
    { name: '保險規劃', slug: 'insurance', description: '各類保險比較、保費規劃', slot: 'evening' },
    { name: '退休規劃', slug: 'retirement', description: '退休金試算、勞退勞保、被動收入', slot: 'evening' },
    { name: '節稅 & 稅務', slug: 'tax', description: '報稅教學、投資稅務、節稅合法', slot: 'evening' },
    { name: '省錢 & 記帳', slug: 'savings', description: '記帳技巧、預算管理、緊急備用金', slot: 'evening' },
  ] as const

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        slot: cat.slot as never,
      },
    })
  }
  console.log('Created 9 categories')

  // Create data sources
  const sources = [
    { name: '鉅亨網', type: 'rss', url: 'https://rssnews.cnyes.com/news/id/headline', slot: ['afternoon', 'evening'], priority: 1 },
    { name: 'MoneyDJ 理財網', type: 'rss', url: 'https://www.moneydj.com/rss/news.aspx', slot: ['afternoon', 'evening'], priority: 2 },
    { name: 'Smart 智富', type: 'rss', url: 'https://www.businessweekly.com.tw/rss/RssFeed.aspx?channelid=11', slot: ['afternoon', 'evening'], priority: 3 },
    { name: '今周刊', type: 'rss', url: 'https://www.businesstoday.com.tw/rss', slot: ['afternoon', 'evening'], priority: 4 },
    { name: 'Money 錢雜誌', type: 'rss', url: 'https://www.money101.com.tw/rss', slot: ['evening'], priority: 5 },
    { name: '自由財經', type: 'rss', url: 'https://ec.ltn.com.tw/rss/finance.xml', slot: ['morning', 'afternoon'], priority: 1 },
    { name: 'ETtoday 財經', type: 'rss', url: 'https://feeds.feedburner.com/ettoday/finance', slot: ['morning'], priority: 2 },
    { name: '聯合報財經', type: 'rss', url: 'https://udn.com/rssfeed/news/2/6638', slot: ['afternoon'], priority: 6 },
    { name: '中時財經', type: 'rss', url: 'https://www.chinatimes.com/rss/money.xml', slot: ['afternoon'], priority: 7 },
    { name: '股感 StockFeel', type: 'rss', url: 'https://www.stockfeel.com.tw/feed/', slot: ['afternoon'], priority: 5 },
    { name: 'Alpha Vantage API', type: 'api', url: 'https://www.alphavantage.co/query', slot: ['morning'], priority: 1 },
    { name: 'TWSE 台灣證交所', type: 'api', url: 'https://openapi.twse.com.tw/v1', slot: ['morning'], priority: 2 },
    { name: 'TAIFEX 期交所', type: 'api', url: 'https://openapi.taifex.com.tw', slot: ['morning'], priority: 3 },
    { name: 'Financial Modeling Prep', type: 'api', url: 'https://financialmodelingprep.com/api/v3', slot: ['morning', 'afternoon'], priority: 4 },
    { name: '金管會', type: 'rss', url: 'https://www.fsc.gov.tw/ch/home.jsp?id=97&parentpath=0,2&mcustomize=news_rss.jsp', slot: ['evening'], priority: 8 },
    { name: '財政部', type: 'rss', url: 'https://www.mof.gov.tw/mofpublish/NewsRss', slot: ['evening'], priority: 9 },
    { name: 'Mr. Market 市場先生', type: 'rss', url: 'https://rich01.com/feed/', slot: ['afternoon', 'evening'], priority: 6 },
    { name: '好險網', type: 'rss', url: 'https://my83.com.tw/feed', slot: ['evening'], priority: 7 },
    { name: 'Investopedia', type: 'rss', url: 'https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline', slot: ['afternoon'], priority: 8 },
    { name: '維基百科金融條目', type: 'rss', url: 'https://zh.wikipedia.org/w/index.php?title=Special:RecentChanges&feed=rss', slot: ['afternoon', 'evening'], priority: 10 },
  ]

  for (const src of sources) {
    await prisma.dataSource.upsert({
      where: { name: src.name },
      update: {},
      create: src,
    })
  }
  console.log('Created 20 data sources')

  // Create default system settings
  const defaultSettings = [
    { key: 'review_mode', value: 'manual' },
    { key: 'disclaimer_text', value: '本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。' },
    { key: 'prediction_disclaimer', value: '預測僅供參考，投資須自行判斷，作者及平台不負任何損益責任。' },
    { key: 'notification_email', value: '' },
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('Created default settings')

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
