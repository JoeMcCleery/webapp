import defu from "defu"
import { FetchError } from "ofetch"

export const catchErrorAsToast = async <T>(
  promise: () => Promise<T>,
  opts: Partial<Toast> = {},
) => {
  const nuxtApp = useNuxtApp()
  try {
    return await nuxtApp.runWithContext(() => promise())
  } catch (error) {
    nuxtApp.runWithContext(() => handleErrorAsToast(error, opts))
  }
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
