<template>
  <UCard variant="subtle">
    <template v-if="title" #header>
      <div class="flex min-h-8 items-center justify-center text-2xl">
        {{ title }}
      </div>
    </template>

    <div class="grid gap-4">
      <slot />
    </div>

    <template #footer>
      <slot name="actions" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "",
  },
})
</script>
