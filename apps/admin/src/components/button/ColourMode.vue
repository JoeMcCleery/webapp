<template>
  <ClientOnly>
    <UButton
      v-if="!colourMode.unknown && !colourMode.forced"
      :icon="isDarkMode ? 'i-lucide-moon' : 'i-lucide-sun'"
      size="xl"
      color="neutral"
      variant="ghost"
      @click="toggleColourMode"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
const colourMode = useColorMode()
const isDarkMode = computed(() => colourMode.value == "dark")
const toggleColourMode = () => {
  colourMode.preference = isDarkMode.value ? "light" : "dark"
}
</script>
