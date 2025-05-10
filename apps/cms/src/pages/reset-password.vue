<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="New Password" name="newPassword" required>
      <InputPassword v-model="state.newPassword" />
    </UFormField>

    <UFormField label="Confirm Password" name="confirmPassword" required>
      <InputPassword v-model="state.confirmPassword" />
    </UFormField>

    <ButtonSubmit />
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const route = useRoute()
const router = useRouter()
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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  let { token, otpToken } = route.query
  if (typeof token != "string") {
    token = ""
  }
  if (typeof otpToken != "string") {
    otpToken = ""
  }
  await catchErrorAsToast(async () => {
    await auth.resetUserPassword({ ...event.data, token, otpToken })
    router.push("/")
  })
}
</script>
