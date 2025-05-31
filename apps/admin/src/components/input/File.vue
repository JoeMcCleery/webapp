<template>
  <div class="grid gap-1">
    <div class="flex gap-0.5">
      <UButton as="label" :for="id" :icon="icon" class="cursor-pointer">
        {{ multiple ? "Select Files" : "Select File" }}
      </UButton>
      <UInput
        v-model="inputValue"
        class="hidden"
        type="file"
        :id="id"
        :accept="accept"
        :multiple="multiple"
        :capture="capture"
        @change="addFiles"
      />

      <UButton
        v-if="files.length > 0"
        icon="i-lucide-x"
        variant="ghost"
        @click="clear"
      />
    </div>

    <div v-for="(file, i) in files" class="flex gap-0.5 overflow-hidden">
      <span
        class="bg-muted max-w-96 overflow-hidden rounded px-2 py-1 text-ellipsis whitespace-nowrap"
      >
        {{ file.name }}
      </span>

      <UButton
        v-if="multiple"
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        @click="removeFile(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const files = defineModel({
  type: Array as PropType<File[]>,
  default: () => [],
})

const props = defineProps({
  id: {
    type: String,
    default: "upload",
  },
  icon: {
    type: String,
    default: "i-lucide-paperclip",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
  },
  capture: {
    type: String as PropType<"user" | "environment">,
  },
})

const inputValue = ref("")

const addFiles = (e: Event) => {
  const input = e.target as HTMLInputElement
  const newFiles = Array.from(input.files ?? [])
  if (props.multiple) {
    // TODO update input's value
    files.value = files.value.concat(newFiles)
  } else {
    files.value = newFiles
  }
}

const clear = () => {
  inputValue.value = ""
  files.value = []
}

const removeFile = (index: number) => {
  // TODO update input's value
  files.value = files.value.toSpliced(index, 1)
}
</script>
