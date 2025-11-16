# Email Templates Manager

A modern, full-stack email template management application built with React, Tailwind CSS, and Express.

## Overview

This project is an email template management system that allows users to:
- Browse 15 predefined email templates across various categories (HR, Events, Finance, Security, etc.)
- Customize email content and subjects
- Send individual emails or bulk emails via CSV upload
- Preview templates in real-time
- Manage email campaigns with a beautiful, responsive UI

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express 5 + Node.js
- **Email**: Nodemailer (supports Ethereal Email testing and real SMTP)
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Directory Structure
```
├── client/               # React frontend application
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn UI component library
│   │   ├── EmailEditor.tsx
│   │   ├── ExcelUploader.tsx
│   │   └── TemplateCard.tsx
│   ├── pages/           # Page components
│   └── App.tsx          # Main app with routing
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── utils/           # Server utilities
│   ├── dev.ts          # Development server entry
│   └── node-build.ts   # Production server entry
├── shared/              # Shared types between client/server
└── public/              # Static assets
```

## Recent Changes

**Date: 2024-11-16**
- Configured for Replit environment
- Updated Vite config to run on port 5000 with host 0.0.0.0
- Added proxy configuration for API routes
- Created separate dev script for backend (runs on port 3001)
- Updated package.json dev scripts to run both servers concurrently
- Configured deployment for autoscale mode

## Development Setup

### Running Locally
The dev workflow is already configured and running. It starts:
1. **Frontend**: Vite dev server on port 5000 (accessible via Replit webview)
2. **Backend**: Express API server on port 3001 (proxied through Vite)

API requests from the frontend to `/api/*` are automatically proxied to the backend server.

### Environment Variables
The project uses `.env` for configuration. Key variables:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - For real email sending
- `FROM_EMAIL`, `FROM_NAME` - Email sender details
- By default, uses Ethereal Email for testing (no setup required)

See `.env.example` for more configuration options.

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `POST /api/send-email` - Send single email
- `POST /api/bulk-send-email` - Send bulk emails from CSV

## Features

### Email Templates
15 predefined templates including:
- Event invitations
- Application acceptance/rejection
- Contest winner notifications
- Security alerts
- Welcome emails
- Event reminders
- Feedback requests
- Order receipts
- Birthday greetings
- And more...

### Email Sending
- Real-time email preview
- HTML editor for customization
- Bulk sending via CSV/Excel upload
- Support for personalization variables
- Progress tracking for bulk sends

## Deployment

This project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Production server serves the built SPA and API on port 5000

## User Preferences

None specified yet.
