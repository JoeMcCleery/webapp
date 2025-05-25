<template>
  <UButton
    v-if="auth.user"
    trailing-icon="i-lucide-refresh-cw"
    @click="submit()"
  >
    Reset Password
  </UButton>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()

const submit = async () =>
  await catchErrorAsToast(async () => {
    if (!auth.user?.email) return
    const token = await auth.forgotPassword({ email: auth.user.email })
    router.push({
      name: "confirm-otp",
      query: {
        token,
      },
    })
  })
</script>
