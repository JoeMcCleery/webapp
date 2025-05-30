<template>
  <header>
    <UContainer class="flex items-center gap-2 p-4 sm:px-6">
      <ButtonHome />

      <div class="w-full"></div>

      <ButtonColourMode />
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const authOptions = useAuthOptions()
</script>
