<template>
  <div class="grid w-full max-w-sm place-items-center gap-2">
    <UForm
      class="w-full max-w-sm"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <FormCard title="Reset Password">
        <p>Enter a new password.</p>

        <UFormField label="New Password" name="newPassword" required>
          <InputPassword
            v-model="state.newPassword"
            v-model:show="showPasswords"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword" required>
          <InputPassword
            v-model="state.confirmPassword"
            v-model:show="showPasswords"
            class="w-full"
          />
        </UFormField>

        <UFormField name="persist">
          <UCheckbox v-model="state.persist" label="Remember me" />
        </UFormField>

        <template #actions>
          <ButtonSubmit
            size="xl"
            class="flex w-full items-center justify-center"
          />
        </template>
      </FormCard>
    </UForm>

    <ULink to="/login"> Remember password? Login </ULink>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

if (auth.user) {
  await navigateTo("/")
}

const showPasswords = ref(false)

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(64, "Must be less than 64 characters"),
    confirmPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(64, "Must be less than 64 characters"),
    persist: z.boolean(),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword != confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmPassword"],
      })
    }
  })

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  newPassword: undefined,
  confirmPassword: undefined,
  persist: false,
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
