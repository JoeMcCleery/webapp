<template>
  <LayoutContainer>
    <h1>Welcome!</h1>
    <div v-for="user in users">
      {{ user }}
    </div>
  </LayoutContainer>
</template>

<script setup lang="ts">
const { $trpc } = useNuxtApp()
const users = await $trpc.user.findMany.query()
</script>
