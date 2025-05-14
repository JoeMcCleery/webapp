<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" class="w-full" />
    </UFormField>

    <ButtonSubmit />
  </UForm>

  <ULink to="/login"> Remember password? Login </ULink>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const router = useRouter()
const auth = useAuthStore()

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
