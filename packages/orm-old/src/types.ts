import type { auth } from "./generated/zenstack/enhance"
import type { Asset, Image } from "./generated/zenstack/models"

export type AuthUser = Required<auth.User> & { image?: Image | null }

export type AssetType = Asset["assetType"]
