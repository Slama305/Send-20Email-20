import { RequestHandler } from "express";
import nodemailer from "nodemailer";
import { BulkEmailRequest, BulkEmailResponse, EMAIL_TEMPLATES } from "../../shared/api";
import { sendEmailWithNodemailer } from "../utils/mailer";

export const handleBulkSendEmail: RequestHandler = async (req, res) => {
  try {
    const payload = req.body as BulkEmailRequest;

    if (!payload.recipients?.length)
      return res.status(400).json({
        success: false,
        message: "No recipients provided",
        totalSent: 0,
        totalFailed: 0,
        results: [],
      } as BulkEmailResponse);

    if (!payload.subject || !payload.content || !payload.gmailEmail || !payload.appPassword)
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        totalSent: 0,
        totalFailed: 0,
        results: [],
      } as BulkEmailResponse);

    const results: any[] = [];
    let successCount = 0, failureCount = 0;

    const template = EMAIL_TEMPLATES.find((t) => t.id === payload.templateId);
    if (!template)
      return res.status(400).json({
        success: false,
        message: "Template not found",
        totalSent: 0,
        totalFailed: 0,
        results: [],
      } as BulkEmailResponse);

    for (const recipient of payload.recipients) {
      try {
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

        const personalizedContent = payload.content.replace(/\[([^\]]+)\]/g, (_, key) => {
          const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "");
          let matchKey = Object.keys(recipient).find(
            (k) => k.toLowerCase().replace(/\s+/g, "") === normalizedKey,
          );

          if (!matchKey) {
            matchKey = Object.keys(recipient).find((k) => {
              const col = k.toLowerCase().replace(/\s+/g, "");
              return col.includes(normalizedKey) || normalizedKey.includes(col);
            });
          }

          return matchKey ? String(recipient[matchKey as keyof typeof recipient]) : `[${key}]`;
        });

        await sendEmailWithNodemailer({
          to: recipient.email,
          recipientName: recipient.name,
          subject: payload.subject,
          html: personalizedContent,
          gmailEmail: payload.gmailEmail,
          appPassword: payload.appPassword,
        });

        results.push({ email: recipient.email, name: recipient.name, success: true });
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
