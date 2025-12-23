import defu from "defu"
import { FetchError } from "ofetch"

export const catchErrorAsToast = async <T>(
  promise: () => Promise<T>,
  opts: Partial<Toast> = {},
) => {
  try {
    return await promise()
  } catch (error) {
    handleErrorAsToast(error, opts)
  }
  return null
}

export const handleErrorAsToast = (
  error: unknown,
  opts: Partial<Toast> = {},
) => {
  const toast = useToast()
  if (error instanceof FetchError) {
    toast.add(
      defu(opts, {
        title: `${error.data.statusCode}: ${error.data.error}`,
        description: error.data?.message ?? error.message,
        color: "error",
      } as Partial<Toast>),
    )
  } else if (isTRPCClientError(error)) {
    if (error.shape) {
      const message = JSON.parse(error.shape.message)
        .map((d: any) => d.message)
        .join("\n")
      toast.add(
        defu(opts, {
          title: `${error.shape.data.httpStatus}: ${error.shape.data.code}`,
          description: message,
          color: "error",
        } as Partial<Toast>),
      )
    } else {
      toast.add(
        defu(opts, {
          title: "Error",
          description: "An unknown trpc error occurred",
          color: "error",
        } as Partial<Toast>),
      )
    }
  } else if (error instanceof Error) {
    toast.add(
      defu(opts, {
        title: "Error",
        description: error.message,
        color: "error",
      } as Partial<Toast>),
    )
  } else {
    toast.add(
      defu(opts, {
        title: "Error",
        description: "An unknown error occurred",
        color: "error",
      } as Partial<Toast>),
    )
  }
}
