<template>
  <UInput
    v-bind="$attrs"
    v-model="password"
    :type="show ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UTooltip :text="show ? 'Hide password' : 'Show password'">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="show ? 'Hide password' : 'Show password'"
          :aria-pressed="show"
          aria-controls="password"
          @click="show = !show"
        />
      </UTooltip>
    </template>
  </UInput>
</template>

<script setup lang="ts">
const password = defineModel<string>()
const show = defineModel<boolean>("show", { default: false })
</script>
