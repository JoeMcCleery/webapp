import { useRuntimeConfig } from "nuxt/app"
import { readonly } from "vue"

export default function useAuthOptions() {
  // Get readonly module options from runtime config
  const runtimeConfig = useRuntimeConfig()
  return readonly(runtimeConfig.public.auth)
}
