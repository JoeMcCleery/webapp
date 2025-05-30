<template>
  <UAvatar :alt="fullName(auth.user)" icon="i-lucide-user-round" />
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
