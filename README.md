# Email Templates Manager

A modern, full-stack email template management application built with React, Tailwind CSS, and Express.

## Features

✨ **15 Predefined Email Templates**
- Event Invitation
- Application Acceptance & Rejection
- Contest Winner Notification
- Security Alerts & Password Reset
- Welcome Email
- Event Reminder
- Feedback Requests
- Order Receipts & Invoices
- Notifications & Updates
- Birthday Greetings
- Service Recovery Apologies

🎨 **Beautiful UI**
- Fully responsive design (mobile, tablet, desktop)
- Template cards with hover effects and shadows
- Live preview of email templates
- Organized by categories (HR, Events, Finance, Security, etc.)
- Search and filter functionality

✏️ **Email Customization**
- Edit email subject and content
- HTML editor for advanced customization
- Real-time preview of changes
- Store recipient details (name and email)

📧 **Email Sending**
- POST endpoint for sending emails
- Nodemailer integration (with Ethereal Email testing support)
- Configurable SMTP settings
- Loading state with spinner during send

## Quick Start

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:8080`

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── client/                    # React frontend
│   ├── components/
│   │   ├── ui/               # Shadcn UI components
│   │   ├── TemplateCard.tsx   # Template selection card
│   │   ├── TemplatePreview.tsx # Email preview iframe
│   │   └── EmailEditor.tsx    # Email editing form
│   ├── pages/
│   │   └── Index.tsx          # Main application page
│   └── App.tsx                # App entry point with routing
│
├── server/                    # Express backend
│   ├── index.ts              # Server setup and routes
│   ├── routes/
│   │   ├── demo.ts           # Demo endpoint
│   │   └── send-email.ts     # Email sending endpoint
│   └── utils/
│       └── mailer.ts         # Nodemailer configuration
│
├── shared/                    # Shared types
│   └── api.ts                # API types and email templates
│
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json              # Project dependencies
```

## Configuration

### Email Setup (Optional)

By default, the app uses **Ethereal Email** for testing (free, no setup required).

To send real emails, set up SMTP credentials:

1. Create a `.env` file in the project root
2. Add your SMTP configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name
```

#### Popular SMTP Providers

**Gmail:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```
(Use App Password, not your regular password)

**SendGrid:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

## API Endpoints

### GET /api/ping
Simple health check endpoint.

**Response:**
```json
{ "message": "ping" }
```

### POST /api/send-email
Send a templated email.

**Request Body:**
```json
{
  "recipientEmail": "john@example.com",
  "recipientName": "John Doe",
  "subject": "Custom subject line",
  "content": "<html>...</html>",
  "templateId": "invitation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "unique-message-id"
}
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express 5
- **Email**: Nodemailer with Ethereal Email testing
- **Build Tool**: Vite
- **Testing**: Vitest
- **Package Manager**: pnpm

## Customization

### Adding New Email Templates

1. Edit `shared/api.ts`
2. Add a new template object to the `EMAIL_TEMPLATES` array:

```typescript
{
  id: "my-template",
  name: "My Template",
  category: "Custom",
  subject: "Template Subject",
  preview: "Short preview text...",
  content: "<html>Full HTML content</html>",
  icon: "📧",
}
```

### Styling

- Global styles: `client/global.css`
- Tailwind theme: `tailwind.config.ts`
- UI components: `client/components/ui/`

## Testing

```bash
pnpm test
```

## Type Checking

```bash
pnpm typecheck
```

## Deployment

### Deploy to Netlify

```bash
pnpm build
# Deploy dist/ folder
```

### Deploy to Vercel

```bash
pnpm build
# Deploy dist/spa/ folder
```

### Docker

The app can be containerized for deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using React, Tailwind CSS, and Express
