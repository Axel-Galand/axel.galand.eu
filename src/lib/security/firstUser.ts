const FIRST_USER_PATHS = ['/admin/create-first-user', '/api/users/first-register']

const normalize = (pathname: string): string => {
  try {
    return decodeURIComponent(pathname).toLowerCase()
  } catch {
    return pathname.toLowerCase()
  }
}

/**
 * Payload lets anyone create the first account while the users table is empty. In production
 * those routes stay closed unless ALLOW_FIRST_USER is exactly "true", set only while creating it,
 * so a missing basic auth in front of /admin can never hand the admin to a stranger.
 */
export const isFirstUserRouteBlocked = (
  pathname: string,
  env: Record<string, string | undefined> = process.env,
): boolean => {
  if (env.NODE_ENV !== 'production' || env.ALLOW_FIRST_USER === 'true') {
    return false
  }

  const path = normalize(pathname)

  return FIRST_USER_PATHS.some((blocked) => path === blocked || path.startsWith(`${blocked}/`))
}
