<template>
  <div class="grid w-full max-w-sm place-items-center gap-2">
    <UForm class="w-full" :schema="schema" :state="state" @submit="onSubmit">
      <FormCard title="Profile Image">
        <p>Upload a profile image or select from an existing image.</p>

        <UFormField label="Profile Image" name="files" required>
          <InputFile v-model="state.files" accept="image/*" />
        </UFormField>

        <template #actions>
          <ButtonSubmit
            text="Upload"
            icon="i-lucide-upload"
            size="xl"
            class="flex w-full items-center justify-center"
          />
        </template>
      </FormCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { InputFile } from "#components"
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

import type { Image } from "@webapp/orm"

const auth = useAuthStore()
const { $trpc } = useNuxtApp()

const schema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Image is required"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  files: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    if (!auth.user) return
    const body = new FormData()
    event.data.files.forEach((f) => body.append("files", f))
    const image = await useAuthFetch<Image>("/upload/image", {
      body,
    })
    await $trpc.user.update.mutate({
      where: {
        id: auth.user.id,
      },
      data: {
        imageId: image.id,
      },
    })
    await auth.fetchUser()
  })
}
</script>
