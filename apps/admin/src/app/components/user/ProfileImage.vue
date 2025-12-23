<template>
  <div class="grid justify-center gap-2">
    <UDropdownMenu :items="items">
      <div class="m-auto cursor-pointer rounded-full">
        <UAvatar
          v-if="auth.user"
          :alt="fullName(auth.user)"
          :src="previewSrc || (!removeImage ? defaultSrc : undefined)"
          size="3xl"
          icon="i-lucide-user-round"
          class="size-32"
        />
      </div>
    </UDropdownMenu>

    <InputFile
      ref="fileInput"
      v-model="files"
      accept="image/*"
      hidden
      @change="onFilesChanged"
    />

    <div v-if="previewSrc || removeImage" class="grid grid-cols-2 gap-1">
      <UButton
        label="Reset"
        icon="i-lucide-refresh-ccw"
        color="neutral"
        variant="subtle"
        loading-auto
        @click="reset"
      />

      <UButton label="Save" icon="i-lucide-save" loading-auto @click="save" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui"

import type { Image } from "@webapp/orm"

const auth = useAuthStore()
const { $trpc } = useNuxtApp()

const removeImage = ref(false)
const defaultSrc = computed(() => auth.user?.image?.url ?? "")
const previewSrc = ref<string | null>(null)
const files = ref<File[]>([])

const fileInput = useTemplateRef("fileInput")

const openFileInput = () => {
  fileInput.value?.openInput()
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Upload Image",
      icon: "i-lucide-image",
      onSelect: openFileInput,
    },
    ...(auth.user?.image?.url && !removeImage.value && !previewSrc.value
      ? [
          {
            label: "Remove Image",
            icon: "i-lucide-trash",
            onSelect: () => (removeImage.value = true),
          },
        ]
      : []),
  ],
])

const onFilesChanged = (files: File[]) => {
  if (files.length > 0) {
    previewSrc.value = URL.createObjectURL(files[0])
    removeImage.value = false
  } else if (previewSrc.value) {
    URL.revokeObjectURL(previewSrc.value)
    previewSrc.value = null
  }
}

const reset = () => {
  removeImage.value = false
  previewSrc.value = null
  files.value = []
}

const save = async () => {
  await catchErrorAsToast(async () => {
    if (!auth.user || (!previewSrc.value && !removeImage.value)) return

    let imageId = null

    if (files.value.length > 0) {
      const body = new FormData()
      files.value.forEach((f) => body.append("files", f))
      const image = await useAuthFetch<Image>("/upload/image", {
        body,
      })
      imageId = image.id
    }

    await $trpc.user.update.mutate({
      where: {
        id: auth.user.id,
      },
      data: {
        imageId,
      },
    })
    await auth.fetchUser()

    reset()
  })
}
</script>
