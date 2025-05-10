<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" />
    </UFormField>

    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password" required>
      <InputPassword v-model="state.password" />
    </UFormField>

    <ButtonSubmit text="Singup" icon="i-lucide-user-round-plus" />
  </UForm>

  <ULink to="/login"> Already have an account? Login </ULink>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const router = useRouter()
const auth = useAuthStore()

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    await auth.signup(event.data)
    router.push("/")
  })
}
</script>
