import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { getSafeRedirect } from 'payload/shared'

import { isAdminUser } from '@/access'

/**
 * Opened by the admin's Preview button. It sits outside the basic auth and checks the Payload
 * session instead, whose SameSite=Strict cookie only comes along from the admin. Draft mode alone
 * shows nothing: pages check the session again before reading drafts (see getReader).
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!isAdminUser(user)) {
    return new Response('Forbidden', { status: 403 })
  }

  const path = getSafeRedirect({ redirectTo: new URL(request.url).searchParams.get('path') ?? '/' })

  ;(await draftMode()).enable()
  redirect(path)
}
