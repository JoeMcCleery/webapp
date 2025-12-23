import { useRuntimeConfig } from "nuxt/app"
import { readonly } from "vue"

export default function useAuthOptions() {
  return readonly(useRuntimeConfig().public.auth)
}
