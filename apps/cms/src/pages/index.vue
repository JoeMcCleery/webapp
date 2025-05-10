<template>
  <div>
    <h1>Welcome!</h1>
    <div class="flex gap-2">
      <ButtonLogout />
      <ButtonLogout all />
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
