<template>
  <div>
    <h1>Welcome!</h1>

    <div class="flex gap-2">
      <ButtonLogout />
      <ButtonLogout all />
    </div>

    <UButton :loading="fetchingUsers" @click="fetchUsers">
      Fetch Users
    </UButton>
    {{ users }}
  </div>
</template>

<script setup lang="ts">
import type { User } from "@webapp/orm"

const users = ref<User[]>([])
const fetchingUsers = ref(false)
const fetchUsers = async () => {
  await catchErrorAsToast(async () => {
    fetchingUsers.value = true
    const res = await useAuthFetch<User[]>("/rpc/user/findMany", {
      method: "GET",
    })
    if (res) {
      users.value = res
    }
    fetchingUsers.value = false
  })
}
</script>
