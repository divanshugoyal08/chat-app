import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetPasswordEmail(
  to: string,
  resetLink: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif">
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
      </div>
    `,
  })
}
