import { prisma } from '@/lib/db'
import SourcesClient from './SourcesClient'

export const dynamic = 'force-dynamic'

export default async function SourcesPage() {
  const sources = await prisma.dataSource.findMany({
    orderBy: [{ isActive: 'desc' }, { priority: 'asc' }],
  })

  return <SourcesClient initialSources={sources} />
}
