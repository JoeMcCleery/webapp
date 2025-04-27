<template>
  <div>
    <h1>Welcome!</h1>
    <UButton @click="auth.logout"> Logout </UButton>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
