import {
  Forbidden,
  type CollectionBeforeOperationHook,
  type GlobalBeforeOperationHook,
  type PayloadRequest,
} from 'payload'

const stripStatus = (data: unknown) => {
  if (data && typeof data === 'object') {
    delete (data as Record<string, unknown>)._status
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
    stripStatus(args.data)

    return { ...args, draft: true }
  }

  return args
}

export const forceGlobalDraftForMcp: GlobalBeforeOperationHook = ({ args, operation, req }) => {
  if (isMcp(req) && operation === 'update') {
    stripStatus(args.data)

    return { ...args, draft: true }
  }

  return args
}
