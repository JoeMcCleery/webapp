<template>
  <USlideover v-if="auth.user" title="Menu" side="left">
    <UButton icon="i-lucide-menu" size="xl" variant="ghost" />

    <template #body>
      <USkeleton class="h-full" />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
