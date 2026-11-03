type Env = Record<string, string | undefined>

const DEV_SERVER_URL = 'http://localhost:3000'

/**
 * SERVER_URL reduced to a bare origin: Payload compares it exactly with the Origin header for
 * CSRF and CORS, so a trailing slash or a path would make every authenticated request fail.
 */
export const getServerURL = (env: Env = process.env): string => {
  const raw = env.SERVER_URL?.trim()

  if (!raw) {
    return DEV_SERVER_URL
  }

  try {
    return new URL(raw).origin
  } catch {
    return raw
  }
}

/**
 * Why the admin would silently stop working in production, or null when SERVER_URL is usable.
 * Checked by /healthz so a bad value fails the deployment instead of the login.
 */
export const serverURLProblem = (env: Env = process.env): string | null => {
  if (env.NODE_ENV !== 'production') {
    return null
  }

  const raw = env.SERVER_URL?.trim()

  if (!raw) {
    return 'SERVER_URL is not set'
  }

  let url: URL

  try {
    url = new URL(raw)
  } catch {
    return 'SERVER_URL is not a valid URL'
  }

  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    return 'SERVER_URL must use https outside localhost'
  }

  return null
}
