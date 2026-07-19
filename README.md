# MicroManus

MicroManus is an advanced, full-stack AI Chat application built with the modern **Svelte 5** ecosystem. It provides a beautiful, responsive, and robust interface for interacting with Large Language Models, complete with authentication, persistent chat history, billing/credits, and deep analytics.

## ✨ Features

- **Modern UI/UX**: Built with Svelte 5, Tailwind CSS v4, and shadcn-svelte for a premium, fast, and highly responsive user experience.
- **AI Integration**: Powered by the Vercel AI SDK, seamlessly connecting to models from OpenAI, Anthropic, and more, including streaming responses and tool-calling capabilities.
- **Robust Authentication**: Secure user login, session management, and OAuth capabilities powered by [Better-Auth](https://better-auth.com/).
- **Database & Persistence**: All chats, messages, and user states are safely stored in PostgreSQL using [Drizzle ORM](https://orm.drizzle.team/).
- **Granular Cost Analytics**: Real-time token tracking. View the exact input, output, and cached token split for every message, and see exactly what it costs.
- **Rich Media & Tools**: Support for file attachments and web-search tools.
- **High-Quality Exporting**: Export your chat conversations beautifully formatted to PDF or Markdown with just a click, utilizing a server-side Playwright rendering engine.
- **Monetization & Credits**: Integrated with [Polar.sh](https://polar.sh/) to manage user subscriptions, credit ledgers, and billing natively.

## 🛠 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn-svelte](https://next.shadcn-svelte.com/)
- **Database**: PostgreSQL (via Neon/Railway)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Payments**: [Polar.sh](https://polar.sh/)
- **Runtime**: [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed.

### 1. Install Dependencies

```bash
bun install
```

### 2. Playwright (For PDF Export)

To ensure the server-side PDF generation works locally, you must install the Chromium binary for Playwright:

```bash
bunx playwright install chromium
```

### 3. Environment Variables

Copy the `.env.example` file to `.env` and fill in your connection strings and API keys:

```bash
cp .env.example .env
```

_(You will need a PostgreSQL database URL, your Better-Auth secret, and API keys for Polar and your AI providers)._

### 4. Database Migrations

Push the database schema to your PostgreSQL database:

```bash
bun run db:push
```

### 5. Start the Development Server

```bash
bun run dev
```

Navigate to `http://localhost:5173` to see the app running!

## 📦 Deployment

This project is configured to run on Bun environments (like Railway). Make sure that your production environment installs Chromium via a build script (or Nixpacks) to support the PDF export functionality.
