# 💰 SmartFinance | AI-Powered Personal Finance Tracker

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
</div>

<br />

**SmartFinance** is a production-ready, multi-tenant personal finance application designed to help users track their transactions, manage monthly subscriptions, set savings goals, and get personalized financial advice powered by AI.

![Dashboard Screenshot](/screenshots/dashboard.png)

## ✨ Core Features

- 📊 **Comprehensive Dashboard:** Real-time financial summary calculating total income, expenses, and available balance based on selected months.
- 🔄 **Smart Recurring Bills:** Track monthly fixed costs. Marking a bill as "Paid" automatically generates a corresponding transaction and updates the global balance instantly.
- 🎯 **Savings Pots:** Create custom savings goals (e.g., "New Car", "Emergency Fund"). Depositing money into a pot automatically deducts it from the main balance.
- 🤖 **AI Financial Advisor (Gemini):** A context-aware AI assistant. It reads your current balance and pending bills securely to provide tailored, sensible financial advice.
- 🔒 **Multi-Tenant Architecture:** Complete data isolation. Users can only see, edit, and delete their own financial records.

---

## 🧠 Technical Highlights & Architecture

This project was built focusing on **Enterprise-grade Security** and **Optimized State Management**.

### 1. Robust Security & Authentication Flow

Built with **Clerk**, the app uses a custom Hook-based JWT verification system:

- The frontend generates a fresh session token via a custom `useApi` hook.
- Every request to the Node.js/Express backend includes this token in the `Authorization` header.
- A custom middleware decodes the token, extracts the `userId`, and prevents unauthorized access.
- **Prisma ORM** strictly enforces data boundaries using `where: { userId }` clauses on every database operation.

### 2. Optimistic UI & State Synchronization

Using **TanStack Query (React Query)**, the application delivers a seamless user experience:

- **Cache Invalidation:** Actions like depositing into a Pot or paying a bill instantly invalidate related queries (like the Dashboard Summary), causing the UI to update in real-time without manual page reloads.
- **Centralized Fetching:** All network requests are routed through a single, secure authenticated fetch wrapper, ensuring zero token leaks and clean React components.

---

## 🛠️ Tech Stack

**Frontend:**

- React.js & TypeScript
- Tailwind CSS & Shadcn/UI (for modern, accessible components)
- TanStack Query (Data fetching and caching)
- Lucide React (Icons)

**Backend:**

- Node.js & Express
- Prisma ORM (with Better-SQLite3 adapter)
- Google Generative AI SDK (Gemini 2.5 Flash)
- Clerk Express SDK (Authentication)

---

## 🚀 Getting Started

Follow these instructions to run the project in your local environment.

### Prerequisites

- Node.js (v18+)
- A [Clerk](https://clerk.com/) account for Auth keys.
- A [Google AI Studio](https://aistudio.google.com/) account for the Gemini API key.

### 1. Backend Setup (`/server`)

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create environment variables
cp .env.example .env

# Fill your .env file with:
# DATABASE_URL="file:./prisma/dev.db"
# CLERK_SECRET_KEY="your_clerk_secret_key"
# GEMINI_API_KEY="your_gemini_api_key"

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### 2. Frontend Setup (`/client`)

```bash
# Navigate to the frontend directory
cd client

# Install dependencies
npm install

# Create environment variables
cp .env.example .env

# Fill your .env file with:
# VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Start the Vite development server
npm run dev
```

---

## 🤝 Future Roadmap

- [ ] Export transactions to CSV/PDF.
- [ ] Migrate database to PostgreSQL (Supabase) for production deployment.

---

_Built with passion and lots of coffee. ☕_
