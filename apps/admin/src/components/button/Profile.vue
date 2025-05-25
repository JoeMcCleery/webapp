<template>
  <UButton
    v-if="auth.user"
    to="/profile"
    icon="i-lucide-user"
    variant="soft"
    active-variant="subtle"
  >
    Profile
  </UButton>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
