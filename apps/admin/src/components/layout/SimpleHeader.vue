<template>
  <header>
    <UContainer class="flex items-center gap-4 p-4 sm:px-6">
      <ButtonHome />
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const authOptions = useAuthOptions()
</script>
