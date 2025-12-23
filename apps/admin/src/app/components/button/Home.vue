<template>
  <UButton
    :to="path"
    icon="i-lucide-house"
    variant="soft"
    size="xl"
    active-variant="subtle"
  >
    Home
  </UButton>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const authOptions = useAuthOptions()
const path = computed(() => (auth.user ? "/" : authOptions.redirectRoute))
</script>
