<template>
  <div class="grid w-full max-w-sm place-items-center gap-2">
    <UForm class="w-full" :schema="schema" :state="state" @submit="onSubmit">
      <FormCard title="Signup">
        <p>Enter your details below to create a new account.</p>

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

        <UFormField name="persist">
          <UCheckbox v-model="state.persist" label="Remember me" />
        </UFormField>

        <template #actions>
          <ButtonSubmit
            icon="i-lucide-user-round-plus"
            size="xl"
            class="flex w-full items-center justify-center"
          >
            Signup
          </ButtonSubmit>
        </template>
      </FormCard>
    </UForm>

    <ULink to="/login"> Already have an account? Login </ULink>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const router = useRouter()
const auth = useAuthStore()

const schema = z.object({
  givenName: z.string().min(1, "Name is required"),
  familyName: z.string().optional(),
  email: z.email(),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(64, "Must be less than 64 characters"),
  persist: z.boolean(),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  givenName: "",
  familyName: undefined,
  email: "",
  password: "",
  persist: false,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    await auth.signup(event.data)
    router.push("/")
  })
}
</script>
