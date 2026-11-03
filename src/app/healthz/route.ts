import config from '@payload-config'
import { getPayload } from 'payload'

import { serverURLProblem } from '@/lib/serverURL'

export const dynamic = 'force-dynamic'

// Kept outside /api so the Traefik basic auth never blocks the container healthcheck.
export const GET = async () => {
  const problem = serverURLProblem()

  if (problem) {
    console.error(`healthz: ${problem}`)

    return Response.json({ status: 'error' }, { status: 503 })
  }

  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'users' })

    return Response.json({ status: 'ok' })
  } catch (error) {
    console.error('healthz: database check failed', error)

    return Response.json({ status: 'error' }, { status: 503 })
  }
}
