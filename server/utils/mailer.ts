import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  recipientName: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  messageId: string;
}

// Create transporter with environment variables or demo mode
function createTransporter() {
  // Check if SMTP credentials are provided
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (smtpHost && smtpPort && smtpUser && smtpPassword) {
    // Use actual SMTP configuration
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  }

  // Use Ethereal Email (free testing service) if no SMTP config provided
  console.warn(
    "No SMTP credentials found. Using Ethereal Email for testing. To use real email, set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD.",
  );

  return nodemailer.createTestAccount().then((testAccount) => {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
}

export async function sendEmailWithNodemailer(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  try {
    const transporter = await createTransporter();

    // Get sender email from env or use default
    const fromEmail = process.env.FROM_EMAIL || "noreply@emailtemplates.app";
    const fromName = process.env.FROM_NAME || "Email Templates";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${options.recipientName}" <${options.to}>`,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log test URL for Ethereal emails
    if (
      process.env.NODE_ENV !== "production" &&
      info.response.includes("250 Message accepted")
    ) {
      console.log("Ethereal preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return {
      messageId: info.messageId || "sent",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
