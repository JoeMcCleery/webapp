import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as SMTPTransport.Options)

export const sendMail = transporter.sendMail
