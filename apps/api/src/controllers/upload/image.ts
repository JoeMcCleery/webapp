import type { FastifyPluginCallback } from "fastify"
import imageSize from "image-size"

import { getObjectUrl, uploadObject } from "@webapp/aws"
import { getEnhancedPrisma, getObjectKey } from "@webapp/orm"

export const image: FastifyPluginCallback = async function (app) {
  app.post("", async function (req, rep) {
    // Check for user
    if (!req.user) {
      return rep.unauthorized("Must be logged in to upload images")
    }
    // Get file from request
    const data = await req.file()
    if (!data) {
      return rep.unprocessableEntity("Missing file from request")
    }
    // Get required properties from multipart file
    const { filename, mimetype } = data
    const key = getObjectKey("Image", filename)
    const buffer = await data.toBuffer()
    // Upload file to s3
    await uploadObject(key, buffer)
    // Create image record
    const { url, expiresAt: urlExpiresAt } = await getObjectUrl(key)
    const { width, height } = imageSize(buffer)
    const prisma = getEnhancedPrisma({ user: req.user })
    const image = await prisma.image.create({
      data: {
        filename,
        mimetype,
        url,
        width,
        height,
        urlExpiresAt,
      },
    })
    // Success
    return rep.status(200).send(image)
  })
}
