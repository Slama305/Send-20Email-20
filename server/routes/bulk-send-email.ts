import { RequestHandler } from "express";
import nodemailer from "nodemailer";
import { BulkEmailRequest, BulkEmailResponse } from "@shared/api";

export const handleBulkSendEmail: RequestHandler = async (req, res) => {
  try {
    const payload = req.body as BulkEmailRequest;

    // Validation
    if (
      !payload.recipients ||
      !Array.isArray(payload.recipients) ||
      payload.recipients.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "No recipients provided",
        totalSent: 0,
        totalFailed: 0,
        results: [],
      } as BulkEmailResponse);
      return;
    }

    if (!payload.subject || !payload.content || !payload.gmailEmail || !payload.appPassword) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: subject, content, gmailEmail, appPassword",
        totalSent: 0,
        totalFailed: 0,
        results: [],
      } as BulkEmailResponse);
      return;
    }

    // Create transporter with Gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: payload.gmailEmail,
        pass: payload.appPassword,
      },
    });

    // Send emails to all recipients
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of payload.recipients) {
      try {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient.email)) {
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: false,
            error: "Invalid email format",
          });
          failureCount++;
          continue;
        }

        // Send email
        await transporter.sendMail({
          from: `"${recipient.name}" <${payload.gmailEmail}>`,
          to: `"${recipient.name}" <${recipient.email}>`,
          subject: payload.subject,
          html: payload.content,
        });

        results.push({
          email: recipient.email,
          name: recipient.name,
          success: true,
        });
        successCount++;
      } catch (error) {
        results.push({
          email: recipient.email,
          name: recipient.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failureCount++;
      }
    }

    res.json({
      success: successCount > 0,
      message: `Sent ${successCount} emails, ${failureCount} failed`,
      totalSent: successCount,
      totalFailed: failureCount,
      results,
    } as BulkEmailResponse);
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to send emails",
      totalSent: 0,
      totalFailed: 0,
      results: [],
    } as BulkEmailResponse);
  }
};
