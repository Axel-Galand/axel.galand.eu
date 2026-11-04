import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Leaves preview and returns to the page it was opened from, when that page is on this site. */
export async function GET(request: Request) {
  ;(await draftMode()).disable()

  const referer = request.headers.get('referer')
  const from = referer ? new URL(referer) : undefined

  redirect(from && from.origin === new URL(request.url).origin ? from.pathname : '/')
}
