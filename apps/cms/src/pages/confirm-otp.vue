<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="OTP Code" name="otpCode" required>
      <UPinInput
        v-model="state.otpCode"
        length="6"
        otp
        @update:modelValue="toUpperCase"
      />
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

const schema = z.object({
  otpCode: z.string().array(),
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
