<template>
  <LayoutContainer>
    <UserProfileImage />

    <table v-if="auth.user">
      <tbody>
        <tr v-for="data in Object.entries(auth.user)">
          <td>{{ data[0] }}:</td>
          <td>{{ data[1] }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex flex-col items-start gap-2">
      <ButtonPasswordReset />
      <ButtonLogout />
      <ButtonLogout all />
    </div>
  </LayoutContainer>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
