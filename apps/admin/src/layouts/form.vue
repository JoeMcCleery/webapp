<template>
  <div class="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr]">
    <LayoutSimpleHeader />

    <div class="grid place-items-center p-4 md:p-8">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup></script>
