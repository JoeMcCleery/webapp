<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Given Name" name="givenName" required>
      <UInput v-model="state.givenName" class="w-full" />
    </UFormField>

    <UFormField label="Family Name" name="familyName" hint="Optional">
      <UInput v-model="state.familyName" class="w-full" />
    </UFormField>

    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" class="w-full" />
    </UFormField>

    <UFormField label="Password" name="password" required>
      <InputPassword v-model="state.password" class="w-full" />
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
  givenName: z.string().min(1, "Name is required"),
  familyName: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(64, "Must be less than 64 characters"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  givenName: undefined,
  familyName: undefined,
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
