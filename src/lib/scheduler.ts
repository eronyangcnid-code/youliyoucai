import { prisma } from './db'
import { fetchRssFeed, RSS_SOURCES } from './rss'
import { fetchAllMarketData, detectMarketAnomaly } from './financial'
import {
  generatePredictionArticle,
  generateKnowledgeArticle,
  generateAnomalyAnalysisArticle,
} from './ai'
import { checkSimilarityAgainstSources, evaluateSimilarity } from './similarity'
import { generateSlug } from './utils'
import type { ArticleStatus, ScheduleSlot } from '@prisma/client'

const WAR_KEYWORDS = ['戰爭', '戰火', '空襲', '核武', '軍事衝突', '制裁', '封鎖', 'war', 'military strike', 'sanction']

async function getRecentCategoryUsage(days = 7): Promise<string[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const articles = await prisma.article.findMany({
    where: {
      createdAt: { gte: since },
      scheduleSlot: { in: ['afternoon', 'evening'] },
    },
    include: { category: true },
    take: 50,
  })

  return articles
    .map((a) => a.category?.name)
    .filter((name): name is string => !!name)
}

async function fetchSourcesForSlot(slot: string) {
  const sources = Object.values(RSS_SOURCES).filter((s) => s.slots.includes(slot))
  const items = await Promise.allSettled(
    sources.map((s) => fetchRssFeed(s.url, 5))
  )
  return items
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => (r as PromiseFulfilledResult<unknown[]>).value as { title: string; summary: string; link: string }[])
}

async function detectWarKeyword(newsTexts: string[]): Promise<boolean> {
  const combined = newsTexts.join(' ')
  return WAR_KEYWORDS.some((kw) => combined.includes(kw))
}

async function saveArticle(
  article: Awaited<ReturnType<typeof generatePredictionArticle>>,
  slot: ScheduleSlot,
  type: 'prediction' | 'knowledge',
  sourceFeeds: string[],
  sourceDataSnapshot: Record<string, unknown>,
  similarityScore: number,
  scheduledAt: Date
) {
  const status: ArticleStatus = (() => {
    const { status } = evaluateSimilarity(similarityScore)
    if (status === 'fail') return 'draft' as ArticleStatus
    if (status === 'warning') return 'warning' as ArticleStatus
    return 'pending' as ArticleStatus
  })()

  // Find or create category
  const categorySlug = article.category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')

  let category = await prisma.category.findFirst({
    where: { name: article.category },
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: article.category,
        slug: categorySlug,
      },
    })
  }

  const slug = generateSlug(article.title)

  return prisma.article.create({
    data: {
      title: article.title,
      slug,
      content: article.content,
      summary: article.summary,
      status,
      categoryId: category.id,
      tags: article.tags,
      articleType: type,
      scheduleSlot: slot,
      generationType: 'auto',
      sourceFeeds,
      sourceDataSnapshot: sourceDataSnapshot as never,
      similarityScore,
      wordCount: article.wordCount,
      scheduledPublishAt: scheduledAt,
    },
  })
}

export async function runMorningSchedule() {
  const startTime = Date.now()
  const log = await prisma.scheduleLog.create({
    data: { slot: 'morning', status: 'pending' },
  })

  try {
    // Fetch market data
    const marketData = await fetchAllMarketData()

    // Fetch morning news
    const newsItems = await fetchSourcesForSlot('morning')

    // Detect anomaly
    const newsTexts = newsItems.map((n) => `${n.title} ${n.summary}`)
    const warDetected = await detectWarKeyword(newsTexts)
    const anomaly = detectMarketAnomaly(marketData, warDetected)

    // Generate prediction article
    const generated = await generatePredictionArticle(marketData, newsItems, anomaly)

    // Similarity check against source summaries
    const score = checkSimilarityAgainstSources(
      generated.content,
      newsItems.map((n) => n.summary)
    )

    const scheduledAt = new Date()
    scheduledAt.setHours(6, 0, 0, 0)

    const article = await saveArticle(
      generated,
      'morning',
      'prediction',
      ['Alpha Vantage API', 'TWSE Open API', '自由財經', 'ETtoday 財經'],
      { marketData, timestamp: new Date().toISOString() },
      score,
      scheduledAt
    )

    // If anomaly is high, also generate deep analysis for afternoon
    if (
      anomaly &&
      ['oil_up_gold_down', 'oil_up_silver_down_more', 'war_gold_down'].includes(anomaly)
    ) {
      const analysisArticle = await generateAnomalyAnalysisArticle(anomaly, marketData, newsItems)
      const analysisScore = checkSimilarityAgainstSources(
        analysisArticle.content,
        newsItems.map((n) => n.summary)
      )
      const afternoonAt = new Date()
      afternoonAt.setHours(14, 0, 0, 0)
      await saveArticle(
        analysisArticle,
        'afternoon',
        'knowledge',
        ['Alpha Vantage API', 'TWSE Open API'],
        { marketData, anomaly, timestamp: new Date().toISOString() },
        analysisScore,
        afternoonAt
      )
    }

    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: {
        status: 'success',
        articleId: article.id,
        duration: Date.now() - startTime,
      },
    })

    return { success: true, articleId: article.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { status: 'failed', errorMsg, duration: Date.now() - startTime },
    })
    throw err
  }
}

export async function runAfternoonSchedule() {
  const startTime = Date.now()
  const log = await prisma.scheduleLog.create({
    data: { slot: 'afternoon', status: 'pending' },
  })

  try {
    const sourceItems = await fetchSourcesForSlot('afternoon')
    const avoidCategories = await getRecentCategoryUsage(7)

    const generated = await generateKnowledgeArticle('afternoon', sourceItems, avoidCategories)

    const score = checkSimilarityAgainstSources(
      generated.content,
      sourceItems.map((n) => n.summary)
    )

    const scheduledAt = new Date()
    scheduledAt.setHours(14, 0, 0, 0)

    const article = await saveArticle(
      generated,
      'afternoon',
      'knowledge',
      ['MoneyDJ', 'Smart 智富', '股感 StockFeel', 'Investopedia'],
      { timestamp: new Date().toISOString() },
      score,
      scheduledAt
    )

    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { status: 'success', articleId: article.id, duration: Date.now() - startTime },
    })

    return { success: true, articleId: article.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { status: 'failed', errorMsg, duration: Date.now() - startTime },
    })
    throw err
  }
}

export async function runEveningSchedule() {
  const startTime = Date.now()
  const log = await prisma.scheduleLog.create({
    data: { slot: 'evening', status: 'pending' },
  })

  try {
    const sourceItems = await fetchSourcesForSlot('evening')
    const avoidCategories = await getRecentCategoryUsage(7)

    const generated = await generateKnowledgeArticle('evening', sourceItems, avoidCategories)

    const score = checkSimilarityAgainstSources(
      generated.content,
      sourceItems.map((n) => n.summary)
    )

    const scheduledAt = new Date()
    scheduledAt.setHours(20, 0, 0, 0)

    const article = await saveArticle(
      generated,
      'evening',
      'knowledge',
      ['好險網', '今周刊', '金管會', 'Money 錢雜誌'],
      { timestamp: new Date().toISOString() },
      score,
      scheduledAt
    )

    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { status: 'success', articleId: article.id, duration: Date.now() - startTime },
    })

    return { success: true, articleId: article.id }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await prisma.scheduleLog.update({
      where: { id: log.id },
      data: { status: 'failed', errorMsg, duration: Date.now() - startTime },
    })
    throw err
  }
}
