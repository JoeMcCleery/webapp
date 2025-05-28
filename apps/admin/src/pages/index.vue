<template>
  <UContainer class="p-4 md:p-8">
    <h1>Welcome!</h1>
    {{ users }}
  </UContainer>
</template>

<script setup lang="ts">
const { $trpc } = useNuxtApp()
const users = await $trpc.user.findMany.query()
</script>
