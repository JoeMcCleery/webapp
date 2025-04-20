import { useRuntimeConfig } from "nuxt/app"

import type { ModuleOptions } from "../../module"

export default function useAuthOptions() {
  // Get module options from runtime config
  const runtimeConfig = useRuntimeConfig()
  const options: Readonly<ModuleOptions> = runtimeConfig.public.auth
  return options
}
