import { TRPCClientError } from "@trpc/client"

import type { AppRouter } from "@webapp/orm"

export function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError
}
