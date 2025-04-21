<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="New Password" name="newPassword">
      <UInput v-model="state.newPassword" type="password" />
    </UFormField>

    <UFormField label="Confirm Password" name="confirmPassword">
      <UInput v-model="state.confirmPassword" type="password" />
    </UFormField>

    <UButton type="submit"> Submit </UButton>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const auth = useAuthStore()

const schema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword != confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  newPassword: undefined,
  confirmPassword: undefined,
})

const route = useRoute()
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  let { token } = route.query
  if (typeof token != "string") {
    token = ""
  }
  await auth.resetUserPassword({ ...event.data, token })
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  })
}
</script>
