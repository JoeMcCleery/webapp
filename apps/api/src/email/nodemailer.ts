import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

export const transporter = nodemailer.createTransport(
  {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: process.env.NODE_ENV !== "development",
    requireTLS: process.env.NODE_ENV !== "development",
    tls: {
      rejectUnauthorized: process.env.NODE_ENV !== "development",
    },
  } as SMTPTransport.Options,
  {
    from: process.env.DEFAULT_FROM_EMAIL,
  },
)

transporter.verify(function (err, success) {
  if (err) {
    console.error(`Nodemailer error: ${err}`)
  }
  if (success) {
    console.log("Nodemailer ready...")
  } else {
    console.error("Nodemailer not ready!")
  }
})
