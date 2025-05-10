<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password" required>
      <InputPassword v-model="state.password" />
      <ULink to="/forgot-password"> Forgotten password? </ULink>
    </UFormField>

    <ButtonSubmit text="Login" icon="i-lucide-log-in" />
  </UForm>

  <ULink to="/signup"> Don't have an account? Signup </ULink>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const router = useRouter()
const auth = useAuthStore()

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    await auth.login(event.data)
    router.push("/")
  })
}
</script>
