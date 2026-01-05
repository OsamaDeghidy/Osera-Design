# 🎨 Osera Design AI – AI Mobile Design Agent

![Osera Design AI](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 🌟 About Osera Design

**Osera Design AI** is an advanced AI-powered platform for creating beautiful mobile UI designs. Transform your ideas into production-ready mobile interfaces using the power of artificial intelligence.

---

## 🗝️ Key Features

- 🔐 **Authentication** with Kinde
- 🤖 **AI-powered mobile UI design generation**
- ✍️ **Generate clean mobile designs from simple prompts**
- 🖼️ **Draggable mobile frame on canvas**
- 🎨 **Customizable themes**
- 🔁 **Regenerate designs instantly**
- 📸 **Export designs as PNG**
- 🌄 **Unsplash integration** for real images
- ⚡ **Real-time design updates**
- 🪝 **Background workflows** with Inngest
- 🌐 **Built with Next.js, MongoDB, Prisma**
- 🎨 **Styled with Tailwind CSS**
- 🚀 **Production-ready architecture**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- OpenRouter API key
- Kinde account for authentication
- Unsplash API key
- Inngest account (optional for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd XDesign-Mobile-Agent-SaaS-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_mongodb_connection_string"

   # OpenRouter AI API
   OPENROUTER_API_KEY="your_openrouter_api_key"

   # Unsplash API
   UNSPLASH_ACCESS_KEY="your_unsplash_access_key"

   # Kinde Authentication
   KINDE_CLIENT_ID="your_kinde_client_id"
   KINDE_CLIENT_SECRET="your_kinde_client_secret"
   KINDE_ISSUER_URL="your_kinde_issuer_url"
   KINDE_SITE_URL="http://localhost:3000"
   KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
   KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/project"

   # Inngest
   INNGEST_SIGNING_KEY="your_inngest_signing_key"
   INNGEST_EVENT_KEY="your_inngest_event_key"

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Run Inngest in development mode** (in a separate terminal)
   ```bash
   npx inngest-cli@latest dev
   ```

7. **Open your browser** at `http://localhost:3000`

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **AI**: OpenRouter API (Google Gemini 2.0 Flash)
- **Authentication**: Kinde
- **Image API**: Unsplash
- **Background Jobs**: Inngest
- **Real-time**: Inngest Realtime

---

## � License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Copyright © 2026 Osera Design. All rights reserved.

---

## 🤝 Support

For issues, questions, or contributions, please reach out to the Osera Design team.

---

## 🙏 Acknowledgments

Built with ❤️ by the Osera Design team.
