<template>
  <UContainer class="p-4 sm:p-6">
    <h1>Welcome!</h1>
    <div v-for="user in users">
      {{ user }}
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { $trpc } = useNuxtApp()
const users = await $trpc.user.findMany.query()
</script>
