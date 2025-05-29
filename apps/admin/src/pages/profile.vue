<template>
  <UContainer class="p4 md:p-8">
    <table v-if="auth.user">
      <tr v-for="data in Object.entries(auth.user)">
        <td>{{ data[0] }}:</td>
        <td>{{ data[1] }}</td>
      </tr>
    </table>

    <div class="flex flex-col items-start gap-2">
      <ButtonPasswordReset />
      <ButtonLogout />
      <ButtonLogout all />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
