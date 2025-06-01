<template>
  <div class="grid w-full max-w-sm place-items-center gap-2">
    <UForm class="w-full" :schema="schema" :state="state" @submit="onSubmit">
      <FormCard title="Login">
        <p>Enter your email and password to login.</p>

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <div>
          <UFormField label="Password" name="password" required>
            <InputPassword v-model="state.password" class="w-full" />
          </UFormField>
          <ULink class="text-sm" to="/forgot-password">
            Forgotten password?
          </ULink>
        </div>

        <UFormField name="persist">
          <UCheckbox v-model="state.persist" label="Remember me" />
        </UFormField>

        <template #actions>
          <ButtonSubmit
            text="Login"
            icon="i-lucide-log-in"
            size="xl"
            class="flex w-full items-center justify-center"
          />
        </template>
      </FormCard>
    </UForm>

    <ULink to="/signup"> Don't have an account? Signup </ULink>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const router = useRouter()
const auth = useAuthStore()

if (auth.user) {
  await navigateTo("/")
}

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(64, "Must be less than 64 characters"),
  persist: z.boolean(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
  persist: false,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    await auth.login(event.data)
    router.push("/")
  })
}
</script>
