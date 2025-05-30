<template>
  <USlideover v-if="auth.user" v-model:open="open">
    <div class="cursor-pointer rounded-full">
      <UserAvatar size="xl" />
    </div>

    <template #title>
      <div class="flex items-center gap-1.5">
        <UserAvatar size="sm" />
        {{ fullName(auth.user) }}
      </div>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" color="neutral" />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const auth = useAuthStore()

const open = ref(false)
const closeMenu = () => (open.value = false)

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: "Your profile",
      icon: "i-lucide-user-round",
      to: "/profile",
      onSelect: closeMenu,
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      onSelect: auth.logout,
    },
  ],
])
</script>
