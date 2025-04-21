<template>
  <div>
    <h1>Default Layout</h1>
    <p>Logged in user: {{ authUser?.name }}</p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const authUser = useAuthUser()
</script>
