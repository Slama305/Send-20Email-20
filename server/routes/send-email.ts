import { RequestHandler } from "express";
import { SendEmailRequest, SendEmailResponse } from "@shared/api";
import { sendEmailWithNodemailer } from "../utils/mailer";

export const handleSendEmail: RequestHandler = async (req, res) => {
  try {
    const payload = req.body as SendEmailRequest;

    // Validation
    if (!payload.recipientEmail || !payload.subject || !payload.content) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: recipientEmail, subject, content",
      } as SendEmailResponse);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.recipientEmail)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      } as SendEmailResponse);
      return;
    }

    // Send email
    const result = await sendEmailWithNodemailer({
      to: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: payload.subject,
      html: payload.content,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    } as SendEmailResponse);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    } as SendEmailResponse);
  }
};
