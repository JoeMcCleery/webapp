<template>
  <div>
    <h1>Default Layout</h1>
    <p>
      Logged in user: {{ auth.user?.name
      }}{{ auth.user?.userRoles.map((r) => r.name) }}
    </p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const auth = useAuthStore()
</script>
