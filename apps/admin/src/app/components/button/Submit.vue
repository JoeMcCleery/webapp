<template>
  <UButton type="submit" :trailing-icon="icon" loading-auto>
    <slot>Submit</slot>
  </UButton>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "i-lucide-send-horizontal",
  },
})
</script>
