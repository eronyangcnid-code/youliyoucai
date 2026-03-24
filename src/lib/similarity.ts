/**
 * N-gram based text similarity checker
 * Computes character-level n-gram overlap between two texts
 */

function getNgrams(text: string, n: number): Set<string> {
  const ngrams = new Set<string>()
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.slice(i, i + n))
  }
  return ngrams
}

export function computeSimilarity(text1: string, text2: string, n = 4): number {
  if (!text1 || !text2) return 0
  const ngrams1 = getNgrams(text1, n)
  const ngrams2 = getNgrams(text2, n)

  if (ngrams1.size === 0 || ngrams2.size === 0) return 0

  let intersection = 0
  for (const gram of ngrams1) {
    if (ngrams2.has(gram)) intersection++
  }

  // Dice coefficient
  return (2 * intersection) / (ngrams1.size + ngrams2.size)
}

export function checkSimilarityAgainstSources(
  generatedText: string,
  sourceTexts: string[]
): number {
  if (sourceTexts.length === 0) return 0
  const scores = sourceTexts.map((src) => computeSimilarity(generatedText, src))
  return Math.max(...scores)
}

export type SimilarityResult = {
  score: number
  status: 'pass' | 'warning' | 'fail'
}

export function evaluateSimilarity(score: number): SimilarityResult {
  if (score < 0.3) return { score, status: 'pass' }
  if (score < 0.5) return { score, status: 'warning' }
  return { score, status: 'fail' }
}
