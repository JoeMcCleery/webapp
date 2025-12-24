<template>
  <USlideover v-if="auth.user" v-model:open="open">
    <div class="cursor-pointer rounded-full">
      <UserAvatar size="xl" />
    </div>

    <template #title>
      <ULink
        class="flex items-center gap-2 rounded-l-full"
        active-class="text-text-primary"
        to="/profile"
        @click="closeMenu"
      >
        <UserAvatar size="2xl" />
        <div class="flex flex-col justify-center">
          {{ fullName(auth.user) }}
          <div class="text-muted text-sm font-normal">
            {{ auth.user.email }}
          </div>
        </div>
      </ULink>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        color="neutral"
        variant="link"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const auth = useAuthStore()
const router = useRouter()

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
      onSelect: () => {
        closeMenu()
        auth.logout()
      },
    },
  ],
])
</script>
