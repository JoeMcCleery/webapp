<template>
  <div class="grid w-full max-w-sm place-items-center gap-2">
    <UForm class="w-full" :schema="schema" :state="state" @submit="onSubmit">
      <FormCard title="Forgot Password">
        <p>Enter your email below to recieve a password reset code.</p>

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" class="w-full" />
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

const router = useRouter()
const auth = useAuthStore()

if (auth.user) {
  await navigateTo("/")
}

const schema = z.object({
  email: z.string().email("Invalid email"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await catchErrorAsToast(async () => {
    const token = await auth.forgotPassword(event.data)
    router.push({
      name: "confirm-otp",
      query: {
        token,
      },
    })
  })
}
</script>
