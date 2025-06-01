<template>
  <div class="grid gap-1">
    <div class="flex gap-0.5">
      <UButton class="cursor-pointer" :icon="icon" @click="openInput()">
        {{ label || (multiple ? "Select Files" : "Select File") }}
      </UButton>
      <UInput
        ref="inputRef"
        v-model="inputValue"
        type="file"
        :id="id"
        :name="id"
        :accept="accept"
        :multiple="multiple"
        :capture="capture"
        hidden
        @change="addFiles($event)"
      />

      <UButton
        v-if="files.length > 0"
        icon="i-lucide-x"
        variant="ghost"
        @click="clear()"
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

const emit = defineEmits<{
  change: [files: File[]]
}>()

const props = defineProps({
  id: {
    type: String,
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
  label: {
    type: String,
  },
})

const { id, emitFormBlur, emitFormInput, emitFormChange } = useFormField(props)

const inputRef = useTemplateRef("inputRef")
const inputValue = ref<string>()

watch(
  files,
  (val) => {
    if (val.length == 0) {
      inputValue.value = ""
    }
    if (inputRef.value?.inputRef) {
      let list = new DataTransfer()
      val.forEach((f) => list.items.add(f))
      inputRef.value.inputRef.files = list.files
    }
    emit("change", val)
    emitFormBlur()
    emitFormInput()
    emitFormChange()
  },
  {
    deep: true,
  },
)

const openInput = () => {
  inputRef.value?.inputRef?.click()
}

const addFiles = (e: Event) => {
  const input = e.target as HTMLInputElement
  const newFiles = Array.from(input.files ?? [])
  if (props.multiple) {
    files.value = uniqueBy(newFiles.concat(files.value), (f) => f.name)
  } else {
    files.value = newFiles
  }
}

const clear = () => {
  files.value = []
}

const removeFile = (index: number) => {
  files.value = files.value.toSpliced(index, 1)
}

defineExpose({
  inputRef: inputRef.value?.inputRef,
})
</script>
