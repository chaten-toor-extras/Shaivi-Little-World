# Shaivi's Little World — Full-Stack Creative Portfolio & Studio CMS

A full-stack creative web experience combining a handcrafted, procedural 3D island with a private, production-quality Studio CMS portal for managing content, media, stories, and visitor letters.

---

## Architecture Overview

This project is organized as an **npm workspaces monorepo**:

```
Portfolio/
├── client/                     # Frontend application (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/                # App Router: public 3D world + /admin/* portal
│   │   ├── components/
│   │   │   ├── admin/          # Ant Design Studio CMS components
│   │   │   ├── experience/     # Three.js / React Three Fiber world & camera
│   │   │   ├── ui/             # Section modals (Gallery, Quotes, Music, Contact, etc.)
│   │   │   └── world/          # Procedural 3D scene geometry & details
│   │   ├── hooks/              # useMusicPlayer, useAuth, useAudio
│   │   ├── providers/          # QueryProvider, ContentProvider (live CMS + offline fallbacks)
│   │   ├── services/           # Axios API services (content, auth, admin, media)
│   │   ├── store/              # Zustand navigation & preference state
│   │   └── types/              # Comprehensive TypeScript interfaces
│   ├── package.json
│   └── next.config.ts
│
├── server/                     # Backend API server (Node.js + Express 5 + MongoDB)
│   ├── src/
│   │   ├── config/             # Zod environment validation, MongoDB, Cloudinary, CORS
│   │   ├── controllers/        # Auth, CMS CRUD, Public bootstrap, Media signatures
│   │   ├── middleware/         # JWT auth, rate limits, double-submit CSRF, errors
│   │   ├── models/             # Mongoose schemas (Admin, Sessions, Artworks, Quotes, etc.)
│   │   ├── routes/             # /api/v1/auth, /api/v1/public, /api/v1/admin
│   │   ├── scripts/            # Database seeders (seedAdmin, seedContent)
│   │   ├── services/           # Token management, Cloudinary signing, CMS helpers
│   │   └── utils/              # AppError, standard API responses, pagination, logger
│   ├── tests/                  # Vitest test suite (auth, public, CMS, health, security)
│   └── package.json
│
├── package.json                # Root monorepo workspace configuration
└── README.md
```

---

## Tech Stack

### Frontend (`client/`)

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, `@react-three/drei`
- **Animations**: GSAP (camera transitions and easing)
- **State Management**: Zustand (navigation FSM and quality settings)
- **Data Layer**: TanStack React Query v5, Axios
- **Admin Portal**: Ant Design 6.x with custom warm editorial palette (scoped exclusively to `/admin/*`)
- **Audio Playback**: Custom `useMusicPlayer` hook wrapping HTMLMediaElement for real audio streaming

### Backend (`server/`)

- **Runtime**: Node.js (ES Modules), Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HttpOnly cookies, bcrypt password hashing, and active session revocation
- **Security**: Double-submit CSRF tokens on mutations, Helmet, CORS allowlist, and express-rate-limit
- **Validation**: Zod request schema validation
- **Media Uploads**: Cloudinary signed browser-to-cloud uploads
- **Testing**: Vitest + Supertest

---

## Getting Started

### Prerequisites

1. **Node.js**: v18.0.0 or higher
2. **MongoDB**: A running MongoDB instance (locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas)
3. **Cloudinary account** (optional for local development; seed content runs with remote reference photos)

### 1. Installation

From the project root:

```bash
npm install
```

### 2. Environment Setup

#### Server Configuration (`server/.env`)

Copy the example file and customize if needed:

```bash
cp server/.env.example server/.env
```

Default local variables:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/shaivis_little_world
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ADMIN_EMAIL=shaividhuwan@gmail.com
ADMIN_PASSWORD=Master@123
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Client Configuration (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Seeding

Initialize the admin account and seed the starting portfolio content:

```bash
# Seed the initial admin account
npm run seed:admin

# Seed default site content, artist profile, artworks, quotes, songs, and journey
npm run seed:content
```

To reset the admin password if already created:

```bash
npm run seed:admin --workspace=server -- --force
```

### 4. Running the Development Environment

Run both client and server concurrently with a single command:

```bash
npm run dev
```

- **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Studio Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## Admin Portal Features (`/admin`)

Login using the seeded administrator credentials:

- **Email**: `shaividhuwan@gmail.com`
- **Password**: `Master@123`

### CMS Modules

1. **Dashboard** (`/admin`): Metrics for published artworks, quotes, songs, journey points, and live visitor mailbox.
2. **Site Settings** (`/admin/site`): Global titles, descriptions, wordmark, footers, exploration labels, and the 3-click butterfly secret facts.
3. **Artist Profile** (`/admin/artist`): Artist name, bio, tags, interactive detail pairs, and portrait media upload.
4. **Quotes TV** (`/admin/quotes`): Add, edit, reorder, and toggle quotes broadcast on the retro television.
5. **Art Gallery** (`/admin/gallery`): Upload new artworks, adjust desk X/Y placement, tilt angles, and reorder.
6. **Star Journey** (`/admin/journey`): Manage chronological journey milestones with custom constellation coordinates.
7. **Music & Moods** (`/admin/music`): Upload songs (with real MP3/AAC audio and cover art) and configure mood palettes (Calm, Dreamy, Focus, Late Night, Rainy, Happy).
8. **Contact Copy** (`/admin/contact`): Customize the little post office copy, field labels, signoff, and success notes.
9. **Visitor Mailbox** (`/admin/letters`): Real-time letter inbox with search, status filters (Unread, Read, Archived), and reader drawer.
10. **Account Settings** (`/admin/settings`): Change admin password with automatic session revocation.

---

## Verification & Testing

Run the automated test suites and type checks across the monorepo:

```bash
# Run server test suite (Vitest + Supertest)
npm run test

# Run TypeScript typecheck across client
npm run typecheck

# Run ESLint validation
npm run lint

# Build production Next.js bundle
npm run build
```

---

## Public Experience Safeguards

- **Graceful Fallback**: If the backend database or network is temporarily unavailable, the public portfolio automatically falls back to built-in default content without throwing errors or breaking the 3D scene.
- **Accessible & Flat Mode**: Users without WebGL hardware or with reduced motion preferences can toggle the accessible flat mode (`Read the simple version`) at any time.
- **Real Audio**: The Music Clock supports real audio playback with buffer and error detection, volume control, track progress, seeking, and auto-advance. Audio autoplay is strictly disabled on page load to respect browser security policies.
