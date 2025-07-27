# 💝 Love2Share

**Share the love, share the streams!** 

A modern platform for sharing streaming service subscriptions with friends and family. Built with Next.js, Prisma, and Clerk authentication.

![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748)
![Clerk](https://img.shields.io/badge/Clerk-6.24.0-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Clerk with role-based access control
- 👥 **Group Management** - Create and manage streaming subscription groups
- 📺 **Multi-Platform Support** - Netflix, Disney+, Prime Video, and more
- 💰 **Cost Calculator** - Automatically calculate per-person costs
- 🎯 **Smart Matching** - Find groups looking for new members
- 📊 **Admin Dashboard** - Comprehensive admin tools for platform management
- 🌙 **Dark/Light Mode** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works perfectly on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Type Safety**: TypeScript throughout
- **Development**: Turbopack for fast dev builds

## 🎯 How It Works

1. **Create or Join Groups** - Start a new streaming group or find existing ones
2. **Add Streaming Services** - Connect your Netflix, Disney+, or other subscriptions
3. **Invite Members** - Share group codes with friends and family
4. **Split Costs** - Automatically calculate everyone's share
5. **Manage Access** - Control who has access to what

## 📋 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- PostgreSQL database
- Clerk account for authentication

### 1. Clone & Install

```bash
git clone https://github.com/fellipemrcl/love2share.git
cd love2share
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Configure your `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/love2share"

# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
SIGNING_SECRET="whsec_..." # For webhooks

# Optional Clerk Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### 3. Database Setup

Set up your PostgreSQL database and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed with sample data
npx tsx scripts/seed-streamings.ts
npx tsx scripts/seed-test-groups.ts
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running! 🎉

## 🏗️ Project Structure

```
love2share/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin management
│   │   │   ├── groups/        # Group operations
│   │   │   ├── streaming/     # Streaming services
│   │   │   └── webhooks/      # Clerk webhooks
│   │   ├── admin/             # Admin dashboard
│   │   ├── groups/            # Group pages
│   │   └── sign-in/           # Authentication pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AdminDashboard/   # Admin components
│   │   ├── CreateGroupForm/  # Group creation
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── docs/                     # Documentation
└── scripts/                  # Database seeding scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Clerk-authenticated users
- **StreamingGroups** - Groups sharing subscriptions
- **StreamingGroupUsers** - User membership in groups
- **Streaming** - Streaming service definitions
- **StreamingGroupStreaming** - Group-specific streaming accounts

## 🎮 Admin Features

Access the admin dashboard at `/admin` (requires admin role):

- 📈 **System Health** - Monitor application status
- 👥 **User Management** - View and manage users
- 🎯 **Group Oversight** - Monitor all streaming groups
- 📺 **Streaming Services** - Add/edit streaming platforms
- 🧪 **Test Data** - Seed development data

## 🔐 Authentication & Security

- **Clerk Integration** - Secure authentication with social logins
- **Role-Based Access** - Owner, Admin, Member roles
- **Protected Routes** - Middleware-based route protection
- **Webhook Security** - Signed webhook verification

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fellipemrcl/love2share)

### Environment Variables for Production

Set these environment variables in your deployment platform:

```env
DATABASE_URL=postgresql://...                    # Production database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...   # Clerk production keys
CLERK_SECRET_KEY=sk_live_...
SIGNING_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Recommended Database Providers

- [Vercel Postgres](https://vercel.com/storage/postgres) - Seamless Vercel integration
- [Railway](https://railway.app) - Easy PostgreSQL hosting
- [Supabase](https://supabase.com) - PostgreSQL with additional features
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📚 API Documentation

Comprehensive API documentation is available in the `/docs` folder:

- [API Streaming Guide](./docs/api-streaming.md) - Streaming service endpoints
- [Authentication Troubleshooting](./docs/auth-troubleshooting.md) - Auth setup help
- [Insomnia Collection](./docs/insomnia-guide.md) - API testing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help:

- 📧 Open an issue on GitHub
- 💬 Check the [documentation](./docs/)
- 🐛 Report bugs with detailed reproduction steps

## 🌟 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Clerk](https://clerk.com) - Authentication made simple
- [Prisma](https://prisma.io) - Database toolkit
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

Made with ❤️ by [Fellipe Marcel](https://github.com/fellipemrcl)

**Share the love, share the streams!** 🎬✨
