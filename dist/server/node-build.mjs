import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import nodemailer from "nodemailer";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  if (smtpHost && smtpPort && smtpUser && smtpPassword) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: process.env.SMTP_SECURE === "true",
      // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });
  }
  console.warn(
    "No SMTP credentials found. Using Ethereal Email for testing. To use real email, set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD."
  );
  return nodemailer.createTestAccount().then((testAccount) => {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  });
}
async function sendEmailWithNodemailer(options) {
  try {
    const transporter = await createTransporter();
    const fromEmail = process.env.FROM_EMAIL || "noreply@emailtemplates.app";
    const fromName = process.env.FROM_NAME || "Email Templates";
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${options.recipientName}" <${options.to}>`,
      subject: options.subject,
      html: options.html
    };
    const info = await transporter.sendMail(mailOptions);
    if (false) ;
    return {
      messageId: info.messageId || "sent"
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
const handleSendEmail = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.recipientEmail || !payload.subject || !payload.content) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: recipientEmail, subject, content"
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.recipientEmail)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
      return;
    }
    const result = await sendEmailWithNodemailer({
      to: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: payload.subject,
      html: payload.content
    });
    res.json({
      success: true,
      message: "Email sent successfully",
      messageId: result.messageId
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email"
    });
  }
};
const handleBulkSendEmail = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.recipients || !Array.isArray(payload.recipients) || payload.recipients.length === 0) {
      res.status(400).json({
        success: false,
        message: "No recipients provided",
        totalSent: 0,
        totalFailed: 0,
        results: []
      });
      return;
    }
    if (!payload.subject || !payload.content || !payload.gmailEmail || !payload.appPassword) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: subject, content, gmailEmail, appPassword",
        totalSent: 0,
        totalFailed: 0,
        results: []
      });
      return;
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: payload.gmailEmail,
        pass: payload.appPassword
      }
    });
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    for (const recipient of payload.recipients) {
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient.email)) {
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: false,
            error: "Invalid email format"
          });
          failureCount++;
          continue;
        }
        await transporter.sendMail({
          from: `"${recipient.name}" <${payload.gmailEmail}>`,
          to: `"${recipient.name}" <${recipient.email}>`,
          subject: payload.subject,
          html: payload.content
        });
        results.push({
          email: recipient.email,
          name: recipient.name,
          success: true
        });
        successCount++;
      } catch (error) {
        results.push({
          email: recipient.email,
          name: recipient.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        failureCount++;
      }
    }
    res.json({
      success: successCount > 0,
      message: `Sent ${successCount} emails, ${failureCount} failed`,
      totalSent: successCount,
      totalFailed: failureCount,
      results
    });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send emails",
      totalSent: 0,
      totalFailed: 0,
      results: []
    });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json({ limit: "50mb" }));
  app2.use(express__default.urlencoded({ extended: true, limit: "50mb" }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/send-email", handleSendEmail);
  app2.post("/api/bulk-send-email", handleBulkSendEmail);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
