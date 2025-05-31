import type { auth } from "./generated/zenstack/enhance"
import { Image } from "./generated/zenstack/models"

export type AuthUser = Required<auth.User> & { image?: Image | null }
