import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  recipientName: string;
  subject: string;
  html: string;
  gmailEmail?: string;
  appPassword?: string;
}

interface SendEmailResult {
  messageId: string;
}

async function createTransporter(gmailEmail?: string, appPassword?: string) {
  if (gmailEmail && appPassword) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailEmail, pass: appPassword },
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (smtpHost && smtpPort && smtpUser && smtpPassword) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPassword },
    });
  }

  console.warn("No SMTP credentials found. Using Ethereal Email for testing.");
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export async function sendEmailWithNodemailer(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  try {
    const transporter = await createTransporter(options.gmailEmail, options.appPassword);

    const fromEmail = options.gmailEmail || process.env.FROM_EMAIL || "noreply@emailtemplates.app";
    const fromName = process.env.FROM_NAME || "Email Templates";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${options.recipientName}" <${options.to}>`,
      subject: options.subject,
      html: options.html,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return { messageId: info.messageId || "sent" };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
