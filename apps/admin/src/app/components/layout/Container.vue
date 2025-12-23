<template>
  <UContainer
    class="p-4 sm:px-6"
    :class="{ 'grid place-items-center': centered }"
  >
    <slot />
  </UContainer>
</template>

<script setup lang="ts">
defineProps({
  centered: {
    type: Boolean,
    default: false,
  },
})
</script>
