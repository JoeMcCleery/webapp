<template>
  <UAvatar
    v-if="auth.user"
    :alt="fullName(auth.user)"
    :src="auth.user.image?.url"
    icon="i-lucide-user-round"
  />
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
