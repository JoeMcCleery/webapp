import { storeToRefs } from "pinia"

import { useAuthStore } from "../stores/auth"

export default function useAuthUser() {
  const auth = useAuthStore()
  const { user } = storeToRefs(auth)
  // Try to fetch the logged in user from the server
  if (!user.value) {
    auth.fetchUser()
  }
  return user
}
