<template>
  <UButton
    trailing-icon="i-lucide-log-out"
    @click="all ? auth.logoutAll() : auth.logout()"
  >
    {{ all ? "Logout All" : "Logout" }}
  </UButton>
</template>

<script setup lang="ts">
defineProps({
  all: {
    type: Boolean,
    default: false,
  },
})
const auth = useAuthStore()
</script>
