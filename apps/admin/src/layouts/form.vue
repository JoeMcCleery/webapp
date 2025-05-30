<template>
  <div class="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr]">
    <LayoutSimpleHeader />

    <div class="grid place-items-center p-4 sm:p-6">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup></script>
