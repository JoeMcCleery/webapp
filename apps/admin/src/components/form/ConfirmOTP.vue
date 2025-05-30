<template>
  <UForm
    class="w-full max-w-sm"
    :schema="schema"
    :state="state"
    @submit="onSubmit"
  >
    <FormCard title="Confirm OTP">
      <p>Enter the 6 character code you recieved in your email inbox.</p>

      <UFormField
        class="grid w-full place-items-center"
        name="otpCode"
        required
      >
        <UPinInput
          v-model="state.otpCode"
          length="6"
          size="xl"
          otp
          @update:modelValue="toUpperCase"
        />
      </UFormField>

      <template #actions>
        <ButtonSubmit
          size="xl"
          class="flex w-full items-center justify-center"
        />
      </template>
    </FormCard>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import * as z from "zod"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const schema = z.object({
  otpCode: z.string().array().length(6, "Must be 6 characters"),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  otpCode: undefined,
})

const toUpperCase = (value?: string[]) => {
  nextTick(() => {
    state.otpCode = value?.map((v) => v.toUpperCase())
  })
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  let { token } = route.query
  if (typeof token != "string") {
    token = ""
  }
  await catchErrorAsToast(async () => {
    const otpToken = await auth.confirmOTPCode({
      otpCode: event.data.otpCode.join(""),
      token,
    })
    router.push({
      name: "reset-password",
      query: {
        token,
        otpToken,
      },
    })
  })
}
</script>
