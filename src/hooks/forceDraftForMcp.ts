import {
  Forbidden,
  type CollectionBeforeOperationHook,
  type GlobalBeforeOperationHook,
  type PayloadRequest,
} from 'payload'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Array rows get new ids. Each row has one primary key across languages, and the localized arrays
 * keep a list per language: English rows sent with the French row ids (copied from a `find`) would
 * make the next publish fail and empty the array. Rich text (`root`) is left alone.
 */
const stripRowIds = (data: Record<string, unknown>) => {
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      for (const row of value) {
        if (isPlainObject(row)) {
          delete row.id
          stripRowIds(row)
        }
      }
    } else if (isPlainObject(value) && !('root' in value)) {
      stripRowIds(value)
    }
  }
}

const prepareData = (data: unknown) => {
  if (isPlainObject(data)) {
    delete data._status
    stripRowIds(data)
  }
}

const isMcp = (req: PayloadRequest) => req.payloadAPI === 'MCP'

/**
 * Everything Claude writes through MCP lands as a draft, and only the admin publishes. This has to
 * run in beforeOperation: Payload decides whether a save is a draft before beforeChange, where
 * forcing `_status` would overwrite (and unpublish) the live document instead.
 */
export const forceDraftForMcp: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (!isMcp(req)) {
    return args
  }

  if (operation === 'delete' || operation === 'restoreVersion') {
    throw new Forbidden(req.t)
  }

  if (operation === 'create' || operation === 'update') {
    prepareData(args.data)

    return { ...args, draft: true }
  }

  return args
}

export const forceGlobalDraftForMcp: GlobalBeforeOperationHook = ({ args, operation, req }) => {
  if (isMcp(req) && operation === 'update') {
    prepareData(args.data)

    return { ...args, draft: true }
  }

  return args
}
