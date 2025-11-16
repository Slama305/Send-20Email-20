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
async function createTransporter(gmailEmail, appPassword) {
  if (gmailEmail && appPassword) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailEmail, pass: appPassword }
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
      auth: { user: smtpUser, pass: smtpPassword }
    });
  }
  console.warn("No SMTP credentials found. Using Ethereal Email for testing.");
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}
async function sendEmailWithNodemailer(options) {
  try {
    const transporter = await createTransporter(options.gmailEmail, options.appPassword);
    const fromEmail = options.gmailEmail || process.env.FROM_EMAIL || "noreply@emailtemplates.app";
    const fromName = process.env.FROM_NAME || "Email Templates";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${options.recipientName}" <${options.to}>`,
      subject: options.subject,
      html: options.html
    });
    if (false) ;
    return { messageId: info.messageId || "sent" };
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
    const credentialsStr = req.session?.gmailCredentials || req.body?.gmailCredentials;
    if (!credentialsStr) throw new Error("Gmail credentials not found");
    const { email: gmailEmail, password: appPassword } = JSON.parse(credentialsStr);
    const result = await sendEmailWithNodemailer({
      to: payload.recipientEmail,
      recipientName: payload.recipientName,
      subject: payload.subject,
      html: payload.content,
      gmailEmail,
      appPassword
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
const EMAIL_TEMPLATES = [
  {
    id: "invitation",
    name: "Event Invitation",
    category: "Events",
    subject: "You're Invited! Join us for an Amazing Event",
    preview: "We'd love to have you at our upcoming event. Join us for a memorable experience...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">You're Invited!</h2>
    <p>Dear [Guest Name],</p>
    <p>We're delighted to invite you to our upcoming event. We hope you can join us for an unforgettable experience filled with great company, interesting conversations, and memorable moments.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <p><strong>Event Details:</strong></p>
      <p>Date: [Date]<br>Time: [Time]<br>Location: [Location]</p>
    </div>
    <p>Please let us know if you can attend by replying to this email.</p>
    <p>Looking forward to seeing you there!</p>
    <p>Best regards,<br>The Team</p>
  </div>
</body>
</html>`,
    icon: "📧"
  },
  {
    id: "acceptance",
    name: "Application Acceptance",
    category: "HR",
    subject: "Congratulations! Your Application Has Been Accepted",
    preview: "Great news! We're excited to offer you the position. Here's what's next...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #27ae60; margin-bottom: 20px;">🎉 Congratulations!</h2>
    <p>Dear [Candidate Name],</p>
    <p>We are thrilled to inform you that your application has been accepted! We believe you're a great fit for our team and we can't wait to work with you.</p>
    <div style="background-color: #f0f8f4; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
      <p><strong>Next Steps:</strong></p>
      <p>1. Review the attached offer letter<br>2. Sign and return the contract<br>3. Complete onboarding forms<br>4. Schedule your start date</p>
    </div>
    <p>If you have any questions, please don't hesitate to reach out. We're here to help make your transition smooth.</p>
    <p>Welcome to our team!<br>Best regards,<br>Human Resources Team</p>
  </div>
</body>
</html>`,
    icon: "✅"
  },
  {
    id: "rejection",
    name: "Application Rejection",
    category: "HR",
    subject: "Thank You For Your Application",
    preview: "We appreciate your interest. While we won't be moving forward at this time...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Thank You For Your Application</h2>
    <p>Dear [Candidate Name],</p>
    <p>Thank you for taking the time to apply and for your interest in joining our organization. We genuinely appreciate the effort you put into your application.</p>
    <p>After careful consideration, we have decided to move forward with other candidates whose backgrounds more closely match our current needs. This decision does not reflect your qualifications or potential.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #95a5a6; margin: 20px 0;">
      <p><strong>We Encourage You To:</strong></p>
      <p>• Keep an eye on our careers page for future opportunities<br>• Connect with us on LinkedIn<br>• Feel free to reapply in the future</p>
    </div>
    <p>We wish you the best of luck in your career journey!</p>
    <p>Best regards,<br>Recruitment Team</p>
  </div>
</body>
</html>`,
    icon: "📋"
  },
  {
    id: "winning",
    name: "Contest Winner Notification",
    category: "Marketing",
    subject: "🏆 You've Won! Claim Your Prize Today",
    preview: "Congratulations! You've been selected as the winner of our contest...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #f39c12; margin-bottom: 20px;">🏆 You're a Winner!</h2>
    <p>Dear [Winner Name],</p>
    <p>Exciting news! You've been selected as the grand prize winner of our [Contest Name]! Congratulations on this amazing achievement!</p>
    <div style="background-color: #fffbea; padding: 15px; border-left: 4px solid #f39c12; margin: 20px 0;">
      <p><strong>Your Prize:</strong></p>
      <p>[Prize Description and Details]</p>
      <p style="margin-top: 15px;"><strong>Prize Value: [Amount]</strong></p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Claim Your Prize:</strong></p>
      <p>To claim your prize, please click the button below or reply to this email with your confirmation.</p>
      <a href="[claim_link]" style="display: inline-block; background-color: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Claim Your Prize</a>
    </div>
    <p>Thank you for your participation. We hope to see you in our next contest!</p>
    <p>Best regards,<br>Contest Team</p>
  </div>
</body>
</html>`,
    icon: "🏆"
  },
  {
    id: "alert",
    name: "Security Alert",
    category: "Security",
    subject: "⚠️ Security Alert - Unusual Activity Detected",
    preview: "We've detected unusual activity on your account. Please review this immediately...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #e74c3c; margin-bottom: 20px;">⚠️ Security Alert</h2>
    <p>Dear [User Name],</p>
    <p>We've detected some unusual activity on your account that requires your immediate attention.</p>
    <div style="background-color: #ffe6e6; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
      <p><strong>Alert Details:</strong></p>
      <p>Activity: [Activity Type]<br>Location: [Location]<br>Time: [Time]<br>Device: [Device Info]</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>If this was you:</strong> No action is needed. You can safely close this email.</p>
      <p><strong>If this wasn't you:</strong> Please secure your account immediately:</p>
      <ol>
        <li>Change your password</li>
        <li>Enable two-factor authentication</li>
        <li>Review recent activity</li>
        <li>Contact our support team</li>
      </ol>
    </div>
    <p>Thank you for keeping your account secure!</p>
    <p>Best regards,<br>Security Team</p>
  </div>
</body>
</html>`,
    icon: "🔒"
  },
  {
    id: "welcome",
    name: "Welcome Email",
    category: "Onboarding",
    subject: "Welcome to Our Platform!",
    preview: "We're excited to have you join our community. Here's how to get started...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #3498db; margin-bottom: 20px;">Welcome Aboard! 🚀</h2>
    <p>Hi [User Name],</p>
    <p>We're thrilled to have you join our community! Whether you're here to [purpose], you're in the right place.</p>
    <div style="background-color: #f0f7ff; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <p><strong>Getting Started:</strong></p>
      <p>1. Complete your profile<br>2. Explore our features<br>3. Check out our tutorial<br>4. Connect with other users</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Quick Links:</strong></p>
      <p><a href="[docs_link]" style="color: #3498db; text-decoration: none;">Documentation</a> | <a href="[help_link]" style="color: #3498db; text-decoration: none;">Help Center</a> | <a href="[community_link]" style="color: #3498db; text-decoration: none;">Community</a></p>
    </div>
    <p>If you have any questions, feel free to reach out. We're always happy to help!</p>
    <p>Best regards,<br>The Team</p>
  </div>
</body>
</html>`,
    icon: "👋"
  },
  {
    id: "reminder",
    name: "Event Reminder",
    category: "Events",
    subject: "Don't Forget! Your Event Starts Tomorrow",
    preview: "Just a friendly reminder about the upcoming event. Here are the details...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #9b59b6; margin-bottom: 20px;">⏰ Event Reminder</h2>
    <p>Hi [Name],</p>
    <p>This is a friendly reminder about the upcoming event you're registered for. We can't wait to see you there!</p>
    <div style="background-color: #f5f0ff; padding: 15px; border-left: 4px solid #9b59b6; margin: 20px 0;">
      <p><strong>Event Details:</strong></p>
      <p><strong>When:</strong> [Date] at [Time]<br><strong>Where:</strong> [Location]<br><strong>Duration:</strong> [Duration]</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>What to Bring/Do:</strong></p>
      <p>[Preparation Instructions]</p>
    </div>
    <p>If you need to reschedule or have questions, please let us know ASAP.</p>
    <p>See you soon!<br>Best regards,<br>Event Team</p>
  </div>
</body>
</html>`,
    icon: "📅"
  },
  {
    id: "feedback",
    name: "Feedback Request",
    category: "Survey",
    subject: "We'd Love Your Feedback",
    preview: "Your opinion matters! Help us improve by sharing your thoughts...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #16a085; margin-bottom: 20px;">📝 Your Feedback Matters</h2>
    <p>Dear [Customer Name],</p>
    <p>We value your opinion and would love to hear about your experience with our product/service. Your feedback helps us improve and serve you better.</p>
    <div style="background-color: #f0fdfb; padding: 15px; border-left: 4px solid #16a085; margin: 20px 0;">
      <p><strong>Quick Survey:</strong></p>
      <p>It only takes 2-3 minutes to complete and your input is invaluable to us.</p>
      <a href="[survey_link]" style="display: inline-block; background-color: #16a085; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Take Survey</a>
    </div>
    <p>Thank you for choosing us and for taking the time to help us improve!</p>
    <p>Best regards,<br>Customer Success Team</p>
  </div>
</body>
</html>`,
    icon: "💬"
  },
  {
    id: "receipt",
    name: "Order Receipt",
    category: "Orders",
    subject: "Order Confirmation #[Order ID]",
    preview: "Thank you for your purchase! Here's your order confirmation and receipt...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Order Confirmation</h2>
    <p>Dear [Customer Name],</p>
    <p>Thank you for your purchase! Your order has been confirmed and is being prepared for shipment.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Order Details:</strong></p>
      <p>Order ID: [Order ID]<br>Date: [Date]<br>Total: [Amount]</p>
      <p style="margin-top: 15px;"><strong>Items:</strong></p>
      <p>[Product List with quantities and prices]</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <p><strong>Shipping Information:</strong></p>
      <p>Estimated Delivery: [Date Range]<br>Tracking Number: [Tracking #]</p>
    </div>
    <p>You can track your order status anytime by visiting your account.</p>
    <p>Thank you for your business!</p>
    <p>Best regards,<br>Order Management Team</p>
  </div>
</body>
</html>`,
    icon: "📦"
  },
  {
    id: "password-reset",
    name: "Password Reset",
    category: "Security",
    subject: "Reset Your Password",
    preview: "We received a request to reset your password. Click the link below to set a new one...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. If you did not make this request, you can ignore this email.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>To reset your password:</strong></p>
      <p>Click the button below to create a new password. This link will expire in 24 hours.</p>
      <a href="[reset_link]" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
    </div>
    <p style="color: #7f8c8d; font-size: 12px;">If you didn't request this, no action is needed. Your password will remain unchanged.</p>
    <p>Best regards,<br>Security Team</p>
  </div>
</body>
</html>`,
    icon: "🔑"
  },
  {
    id: "notification",
    name: "General Notification",
    category: "Updates",
    subject: "Important Update From Us",
    preview: "We have an important update to share with you. Please read below...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">📢 Important Update</h2>
    <p>Dear [User Name],</p>
    <p>We wanted to keep you informed about some important changes in our service.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <p><strong>What's Changing:</strong></p>
      <p>[Detailed change description]</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>When:</strong> [Date]<br><strong>Impact:</strong> [How it affects users]<br><strong>What You Need To Do:</strong> [Action items if any]</p>
    </div>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The Team</p>
  </div>
</body>
</html>`,
    icon: "📬"
  },
  {
    id: "invoice",
    name: "Invoice",
    category: "Finance",
    subject: "Invoice #[Invoice ID] From [Company Name]",
    preview: "Your invoice is ready. Please find the details and payment options below...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Invoice</h2>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Invoice #:</strong> [Invoice ID]<br><strong>Invoice Date:</strong> [Date]<br><strong>Due Date:</strong> [Date]</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Bill To:</strong></p>
      <p>[Customer Name]<br>[Company Name]<br>[Address]</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #ecf0f1;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Quantity</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Unit Price</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">[Item Description]</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">[Qty]</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">[Price]</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">[Total]</td>
        </tr>
      </tbody>
    </table>
    <div style="background-color: #ecf0f1; padding: 15px; border-radius: 4px; text-align: right;">
      <p><strong>Subtotal:</strong> [Amount]<br><strong>Tax:</strong> [Amount]<br><strong style="font-size: 16px;">Total Due: [Amount]</strong></p>
    </div>
    <p style="margin-top: 20px;">Please remit payment by [Due Date]. Thank you for your business!</p>
    <p>Best regards,<br>[Company Name]</p>
  </div>
</body>
</html>`,
    icon: "💰"
  },
  {
    id: "birthday",
    name: "Birthday Greeting",
    category: "Personal",
    subject: "🎉 Happy Birthday [Name]!",
    preview: "Wishing you a wonderful birthday filled with joy and celebration...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <h2 style="margin-bottom: 20px; text-align: center;">🎉 Happy Birthday!</h2>
    <p style="text-align: center; font-size: 18px;">Dear [Name],</p>
    <p style="text-align: center; margin: 20px 0;">On your special day, we want to wish you all the happiness, joy, and success that you deserve. May this year bring you wonderful moments and memorable experiences!</p>
    <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
      <p>🎂 Enjoy your special day 🎂</p>
    </div>
    <p style="text-align: center; margin-top: 20px;">Cheers to another year of greatness!<br><br>Warmest regards,<br>The Team</p>
  </div>
</body>
</html>`,
    icon: "🎂"
  },
  {
    id: "apology",
    name: "Apology/Service Recovery",
    category: "Support",
    subject: "We Apologize - Here's How We're Making It Right",
    preview: "We sincerely apologize for the inconvenience. Here's what we're doing to fix it...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #e74c3c; margin-bottom: 20px;">We Sincerely Apologize</h2>
    <p>Dear [Customer Name],</p>
    <p>We deeply apologize for the recent issue you experienced with [service/product]. We understand how frustrating this must have been, and we take full responsibility.</p>
    <div style="background-color: #ffe6e6; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
      <p><strong>What Went Wrong:</strong></p>
      <p>[Honest explanation of the issue]</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <p><strong>Here's What We're Doing:</strong></p>
      <p>1. [Action item 1]<br>2. [Action item 2]<br>3. [Action item 3]</p>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p><strong>Your Compensation:</strong></p>
      <p>[Details of service recovery offer]</p>
    </div>
    <p>Thank you for your patience and understanding. We're committed to regaining your trust.</p>
    <p>Best regards,<br>Customer Care Team</p>
  </div>
</body>
</html>`,
    icon: "🙏"
  },
  {
    id: "newsletter",
    name: "Newsletter",
    category: "Marketing",
    subject: "Your Monthly Newsletter - [Month] Edition",
    preview: "Check out the latest updates, news, and insights from this month...",
    content: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">📰 Monthly Newsletter</h2>
    <p>Hi [Subscriber Name],</p>
    <p>Welcome to our [Month] newsletter! This month, we're sharing exciting updates, valuable insights, and exclusive content just for our subscribers.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2c3e50;">📌 Featured Article</h3>
      <p><strong>[Article Title]</strong></p>
      <p>[Article summary goes here...]</p>
      <a href="[article_link]" style="color: #3498db; text-decoration: none; font-weight: bold;">Read More →</a>
    </div>

    <div style="background-color: #f0fdfb; padding: 15px; border-left: 4px solid #16a085; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2c3e50;">💡 This Month's Tips</h3>
      <ul style="padding-left: 20px;">
        <li>[Tip 1: Brief description]</li>
        <li>[Tip 2: Brief description]</li>
        <li>[Tip 3: Brief description]</li>
      </ul>
    </div>

    <div style="background-color: #fff5f0; padding: 15px; border-left: 4px solid #e67e22; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2c3e50;">🌟 Community Spotlight</h3>
      <p>[Feature a community member or success story here...]</p>
    </div>

    <div style="background-color: #ecf0f1; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
      <a href="[view_online_link]" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Browser</a>
    </div>

    <p style="color: #7f8c8d; font-size: 12px;">You're receiving this because you subscribed to our newsletter. <a href="[unsubscribe_link]" style="color: #7f8c8d;">Unsubscribe</a></p>
    <p>Best regards,<br>The Team</p>
  </div>
</body>
</html>`,
    icon: "📰"
  }
];
const handleBulkSendEmail = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.recipients?.length)
      return res.status(400).json({
        success: false,
        message: "No recipients provided",
        totalSent: 0,
        totalFailed: 0,
        results: []
      });
    if (!payload.subject || !payload.content || !payload.gmailEmail || !payload.appPassword)
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        totalSent: 0,
        totalFailed: 0,
        results: []
      });
    const results = [];
    let successCount = 0, failureCount = 0;
    const template = EMAIL_TEMPLATES.find((t) => t.id === payload.templateId);
    if (!template)
      return res.status(400).json({
        success: false,
        message: "Template not found",
        totalSent: 0,
        totalFailed: 0,
        results: []
      });
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
        const personalizedContent = payload.content.replace(/\[([^\]]+)\]/g, (_, key) => {
          const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "");
          let matchKey = Object.keys(recipient).find(
            (k) => k.toLowerCase().replace(/\s+/g, "") === normalizedKey
          );
          if (!matchKey) {
            matchKey = Object.keys(recipient).find((k) => {
              const col = k.toLowerCase().replace(/\s+/g, "");
              return col.includes(normalizedKey) || normalizedKey.includes(col);
            });
          }
          return matchKey ? String(recipient[matchKey]) : `[${key}]`;
        });
        await sendEmailWithNodemailer({
          to: recipient.email,
          recipientName: recipient.name,
          subject: payload.subject,
          html: personalizedContent,
          gmailEmail: payload.gmailEmail,
          appPassword: payload.appPassword
        });
        results.push({ email: recipient.email, name: recipient.name, success: true });
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
