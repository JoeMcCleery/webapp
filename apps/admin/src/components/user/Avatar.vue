<template>
  <UAvatar
    size="lg"
    :alt="fullName"
    icon="i-lucide-user-round"
    :ui="{ root: 'bg-accented' }"
  />
</template>

<script setup lang="ts">
const auth = useAuthStore()
const fullName = computed(
  () => `${auth.user?.givenName || ""} ${auth.user?.familyName || ""}`,
)
</script>
