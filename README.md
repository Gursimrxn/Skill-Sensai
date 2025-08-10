
# Skill Sensei 🥋 – Swap Skills. Grow Together.

**Skill Sensei** is a modern, minimal web app that allows users to **list skills they offer**, **request skills they want**, and **connect with others for mutually beneficial learning swaps**. Built with [Next.js 13+ App Router](https://nextjs.org), TypeScript, and a clean architecture, the platform fosters a community where *everyone is both a teacher and a learner*.

Demo Video -->https://drive.google.com/drive/folders/1FAJeiG28JpTm9PVGaMLExYIj_88cVqt-?usp=sharing
---

## 🚀 Getting Started

First, clone the repo and install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Then, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 🧠 Key Features

- 🔐 Authentication with NextAuth
- 👤 Create Profiles with name, skills offered, skills wanted, and availability
- 🧩 Skill Matching: Search users by skills (e.g., Photoshop, Excel)
- 🔁 Swap Requests: Accept/reject/delete swaps
- ⭐ Ratings after a successful swap
- 👀 Public/Private Profile toggle
- 📆 Availability preferences (e.g., evenings, weekends)
- 🛡️ Admin moderation for spammy content and user behavior

---

## 🗂️ Project Structure

```
app/                          # App Router structure
├── api/                      # API Routes
│   ├── auth/[...nextauth]/   # NextAuth config
│   └── onboarding/           # User onboarding APIs
├── onboarding/               # Onboarding pages
├── profile/                  # User profile pages
└── test/                     # Temporary/testing interface
components/                   # UI components
├── onboarding/              # Reusable onboarding components
├── animations/              # Framer Motion variants
└── providers/               # App context providers
hooks/                       # Custom React hooks
lib/                         # Core application logic
├── core/                    # Shared types and utilities
├── db/                      # Database setup
│   ├── models/              # MongoDB schemas
│   └── repositories/        # Data access logic
├── services/                # Business logic services
└── di/                      # Dependency injection
types/                       # Global TypeScript types
```

---

## 🎨 Design

View the full design on Figma:  
👉 [Figma Prototype](https://www.figma.com/design/wGIsfS4RwfN25gznxTu3yM/Untitled?node-id=0-1&t=IgzypozFpqiQwrZ1-1)

---

## 👥 Team

Built with 💡 by **Team Skill Sensei**  
Members: Gursimran Singh | Ekaspreet singh Atwal | Aagam Jain | Jashanjot Singh

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Vercel Deployment](https://vercel.com/new)

---

## ☁️ Deployment

Deploy Skill Sensei with a single click using **Vercel**:  
👉 [Deploy on Vercel](https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template)

---

## 📄 License

This project is licensed under the MIT License.
