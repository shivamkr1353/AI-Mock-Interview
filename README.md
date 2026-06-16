# 🚀 AI Mock Interview Platform

## 🌟 Project Overview

A cutting-edge AI-powered mock interview platform designed to revolutionize interview preparation through advanced technology and intelligent feedback mechanisms.

## 🔥 Key Features

### 🤖 AI-Powered Interview Generation
- Dynamically generates interview questions based on job roles
- Utilizes advanced AI to create context-specific questions
- Supports multiple tech stacks and experience levels

### 🎙️ Advanced Speech Recognition
- Real-time speech-to-text conversion
- Supports multiple languages
- Precise transcription with high accuracy

### 💡 Intelligent Feedback Mechanism
- AI-driven performance analysis
- Instant rating and detailed feedback
- Personalized improvement suggestions

### ❌ Delete Feature
- Users can delete past interview sessions
- Ensures privacy and control over data
- One-click deletion for convenience

### 🔒 Secure Authentication
- Seamless Clerk authentication
- User profile management
- Secure data handling

## 🛠 Tech Stack

### Frontend
- Next.js 15
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Lucide React Icons

### Backend
- Drizzle ORM
- Gemini AI
- Speech Recognition API

### Authentication
- Clerk Authentication

### Database
- Neon PostgreSQL (Serverless)

### Deployment
- Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Gemini AI API Key
- Clerk Authentication Setup
- Neon PostgreSQL Database

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
```

2. Install dependencies
```bash
cd ai-mock-interview
npm install
```

3. Set up environment variables
```bash
# .env.local file
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_DRIZZLE_DB_URL=
NEXT_PUBLIC_INTERVIEW_QUES_COUNT=10
```

4. Push the database schema
```bash
npm run db:push
```

5. Run the development server
```bash
npm run dev
```

## 📞 Contact

Shivam: [EMAIL_ADDRESS]

## 📜 License

© 2025 Shivam. All Rights Reserved.
