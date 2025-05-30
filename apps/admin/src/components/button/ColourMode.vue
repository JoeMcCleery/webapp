<template>
  <UButton
    :icon="isDarkMode ? 'i-lucide-moon' : 'i-lucide-sun'"
    size="xl"
    color="neutral"
    variant="ghost"
    @click="toggleColourMode"
  />
</template>

<script setup lang="ts">
const colourMode = useColorMode()
const isDarkMode = computed(() => colourMode.value == "dark")
const toggleColourMode = () => {
  colourMode.preference = isDarkMode.value ? "light" : "dark"
}
</script>
