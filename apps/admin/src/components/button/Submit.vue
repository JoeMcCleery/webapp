<template>
  <UButton :trailing-icon="icon" type="submit">{{ text }}</UButton>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "i-lucide-send-horizontal",
  },
  text: {
    type: String,
    default: "Submit",
  },
})
</script>
