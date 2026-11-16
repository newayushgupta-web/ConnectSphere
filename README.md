# 🌐 ConnectSphere — Mini Social Media Platform

> **CodeAlpha Full Stack Development Internship (Task 2)**  
> Built by a Senior Full-Stack Engineer with React 18, Vite, Node.js, Express, MongoDB (Mongoose), Tailwind CSS, and Socket.io.

[![Tests](https://img.shields.io/badge/tests-22%20passed-emerald.svg)](https://jestjs.io/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

---

## 📖 1. Overview

**ConnectSphere** is a modern, responsive, production-quality mini social media web platform engineered to deliver seamless community interactions. Designed following clean architecture principles (MVC with a Service layer), ConnectSphere features real-time interactions, persistent dark/light theme switching, full responsive mobile bottom navigation, optimistic UI updates, crypto-secure password resets with Nodemailer, bookmarks, auto-extracted hashtags, stories carousel, and robust security protections.

---

## ✨ 2. Key Features

### 🔐 User Authentication & Authorization
- **Email or Username Login**: Flexible sign-in supporting either identifier with password.
- **JWT Authentication**: Secure stateless token issuance and verification with HTTP Bearer Authorization headers.
- **Bcrypt Hashing**: Passwords securely hashed with salt rounds (10+); `passwordHash` is never leaked or returned in responses.
- **Protected Routes**: Navigation guards prevent unauthorized access on both client and API routes.
- **Secure Password Reset Flow**:
  - Request reset link with email (`POST /api/auth/forgot-password`).
  - Rate-limited with IP protection (5 requests per 15 minutes).
  - 32-byte crypto random token stored as SHA-256 hash with 15-minute expiration.
  - Nodemailer email dispatch (Ethereal test accounts in development with preview URLs logged to console, SMTP via `.env` in production).
  - Anti-enumeration protection (identical generic response returned whether user exists or not).
  - Interactive password reset screen with strength meter (Weak/Fair/Good/Strong) and single-use link consumption (`POST /api/auth/reset-password/:token`).

### 👤 User Profiles & Follow System
- **Instagram-Style Profile Header**: Modern layout with user avatar, cover banner, username, join date, interactive bio, location, website link, and real-time stats counters.
- **Follow / Unfollow Mechanism**: Instant toggle with self-follow prevention (enforced at API level with 400 Bad Request).
- **Interactive Modals**: Clickable follower/following counters fetching full rosters from `/api/users/:id/followers` and `/api/users/:id/following`.
- **Profile Customization**: Edit bio, location, website, and upload avatar and cover banner images with live preview via Multer (`upload.fields`).
- **Saved Posts (Bookmarks)**: Dedicated tab on own profile to view bookmarked stories and media.
- **Who-To-Follow Sidebar**: Recommended creators to expand community reach.

### 📝 Posts, Media & Interaction
- **Rich Post Composer**: Create posts with text (up to 1,000 characters), character counter, and optional image uploads (JPEG, PNG, WEBP, GIF up to 5MB).
- **Hashtag System**: `#hashtags` are automatically extracted and indexed on save. Clickable hashtags filter the community feed.
- **@Mentions**: Clickable `@username` mentions linking directly to creator profiles.
- **Optimistic UI Like Toggle**: Immediate visual heart burst animation (`animate-heart`) with instant like count increment/decrement.
- **Double-Tap to Like**: Double-tap post images on mobile/desktop to trigger a floating heart reaction.
- **Post Bookmarks**: One-click bookmark toggle on any post with optimistic state and persistent storage.
- **Post Editing & Deletion**: Owner-only authorization guard (403 Forbidden for non-owners) with cascade deletion of related comments and notifications.
- **Direct Link Sharing**: One-click URL copy with animated toast alerts.

### 💬 Threaded Comments
- **Real-Time Commenting**: Add and view comments per post, complete with author avatars and relative timestamps (`formatDistanceToNow`).
- **Inline Previews**: "View all N comments" preview toggle.
- **Owner Deletion**: Comment authors can delete their comments, automatically decrementing post comment counters.

### 📰 Home Feed, Stories & Exploration
- **Stories Carousel**: Instagram-style circular avatar row at the top of the feed with gradient active borders and full-screen story viewer modal with timer progress bars.
- **Smart Feed Aggregation**: Chronological feed containing posts from users you follow + your own posts.
- **Auto-Discovery Fallback**: New users with 0 followed accounts automatically see trending platform posts to immediately engage.
- **Trending Hashtags**: Real-time trending hashtag aggregation surfaced in the right exploration sidebar.
- **Pagination & Infinite Loading**: Efficient page/limit aggregation queries.
- **Live User Search**: Instant regex search by username or keywords in bio.

### 🔔 Real-Time Notifications (Socket.io)
- **Live Event Dispatch**: Instant alerts for Likes, Comments, and Follows delivered in real-time over WebSocket.
- **Grouped Notification Inbox**: Clean categorization into "Today" (within 24 hours) and "Earlier", with read/unread badges, sender avatars, post snippet previews, and one-click "Mark All as Read".

### 🎨 Premium UI / UX
- **Inter Typography**: Clean, modern aesthetic with soft shadows (`shadow-soft`) and rounded cards.
- **Dark Mode**: Persisted dark/light theme toggle saved in `localStorage` and synchronized with CSS variables. Meets WCAG AA contrast (4.5:1).
- **Split-Screen Auth Pages**: High-conversion split-screen layout with brand gradient, creator social proof badges, and live demo chips.
- **Mobile First Design**: Sticky header, floating action button (`+` FAB), and responsive bottom navigation bar on mobile viewports.
- **Feedback & States**: Skeleton shimmer loaders, toast notification system, and friendly empty states.

---

## 🏗️ 3. Architecture & Tech Stack

### High-Level Architecture Diagram

```mermaid
flowchart TD
    Client["React 18 + Vite (Client)\nTailwind CSS + Context API + Lucide"]
    Router["React Router v6"]
    Axios["Axios Interceptor (JWT + Bearer)"]
    SocketClient["Socket.io Client"]

    API["Express REST API (Server)"]
    Security["Helmet + CORS + RateLimit + MongoSanitize"]
    AuthGuard["Auth Middleware (JWT Verify)"]
    Controllers["Controllers (MVC)"]
    Services["Service Layer (Business Logic)"]
    EmailSvc["Email Service (Nodemailer / Ethereal)"]
    Models["Mongoose Models (User, Post, Comment, Notification)"]
    Multer["Multer File Uploads (/uploads)"]
    SocketServer["Socket.io Server (Rooms & Events)"]
    DB[("MongoDB / Atlas / In-Memory Server")]

    Client --> Router --> Axios
    Client --> SocketClient
    Axios -->|HTTP Requests| Security --> AuthGuard --> Controllers --> Services --> Models --> DB
    Services --> EmailSvc
    Multer -->|Static Storage| Controllers
    Services -->|Real-time Emit| SocketServer -->|WebSocket| SocketClient
```

### Tech Stack Breakdown

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6, Axios, Date-fns, Socket.io-client |
| **Backend** | Node.js, Express.js (MVC + Service Layer), Socket.io, Nodemailer |
| **Database** | MongoDB with Mongoose ODM (includes zero-config in-memory fallback for instant dev/eval) |
| **Authentication** | JWT (JSON Web Tokens), Bcryptjs, Crypto SHA-256 Reset Tokens |
| **Security** | Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, Centralized Error Handling |
| **File Storage** | Multer disk storage (served at `/uploads`), Cloudinary-ready abstraction |
| **Testing** | Jest, Supertest (22 unit & integration tests) |

---

## 📊 4. Data Models & Indexes

```mermaid
erDiagram
    User ||--o{ Post : "authors"
    User ||--o{ Comment : "writes"
    User ||--o{ Notification : "receives / triggers"
    Post ||--o{ Comment : "contains"
    Post ||--o{ Notification : "referenced by"

    User {
        ObjectId _id PK
        string username "unique, indexed"
        string email "unique, indexed"
        string passwordHash "excluded in JSON"
        string avatar
        string cover
        string location
        string website
        string bio
        ObjectId[] followers "ref User"
        ObjectId[] following "ref User"
        ObjectId[] bookmarks "ref Post"
        string resetPasswordToken "hashed, select false"
        date resetPasswordExpires "select false"
        date createdAt
    }

    Post {
        ObjectId _id PK
        ObjectId author FK "ref User, indexed"
        string text "max 1000 chars"
        string image "optional URL"
        string[] hashtags "indexed"
        ObjectId[] likes "ref User"
        number commentsCount
        date createdAt "indexed desc"
    }

    Comment {
        ObjectId _id PK
        ObjectId post FK "ref Post, indexed"
        ObjectId author FK "ref User, indexed"
        string text "max 300 chars"
        date createdAt
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK "ref User, indexed"
        ObjectId sender FK "ref User"
        string type "like | comment | follow"
        ObjectId post FK "ref Post, optional"
        boolean isRead "default false"
        date createdAt
    }
```

---

## 🚀 5. Quick Start & Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v25)
- **npm** v9+
- *(Optional)* MongoDB Atlas connection string. If omitted, the app **automatically launches an in-memory MongoDB instance** out-of-the-box!

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/CodeAlpha_SocialMediaPlatform.git
   cd CodeAlpha_SocialMediaPlatform
   ```

2. **Install all dependencies (root, backend, frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Copy the provided `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
   *(Defaults are pre-configured to work immediately on localhost).*

4. **Seed Demo Accounts & Content:**
   ```bash
   npm run seed
   ```
   *Creates 5 demo users with profile banners, locations, websites, posts, comments, likes, notifications, and follower graphs!*

5. **Start Both Client and Server:**
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 6. Demo Accounts (1-Click Fill on Login Page)

Every demo account uses password: `password123`

| Username | Role / Niche | Location | Website | Bio Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **`alex_tech`** | Full-Stack Engineer | San Francisco, CA | alexrivera.dev | React, Express, distributed systems, open-source |
| **`maya_designer`** | Product Designer | New York, NY | mayadesign.co | Design systems, micro-interactions, dark mode UX |
| **`dev_sam`** | Backend Developer | London, UK | sampatel.cloud | Node streams, MongoDB indexing, Redis caching |
| **`elena_photo`** | Visual Storyteller | Tokyo, Japan | elenaphoto.art | Urban reflections, street aesthetics, golden hour |
| **`jordan_ai`** | AI/ML Researcher | Seattle, WA | jordank.ai | Multi-agent coordination, LLMs, neural networks |

---

## 📡 7. API Reference

All responses strictly follow the standardized envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (username, email, password, bio) |
| `POST` | `/api/auth/login` | Public | Sign in with email or username + password |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset link to email (rate-limited) |
| `POST` | `/api/auth/reset-password/:token` | Public | Set new password using single-use crypto token |

### Users & Follows (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/search?q=` | Public | Search members by username or keywords in bio |
| `GET` | `/api/users/suggestions` | Private | Retrieve "Who To Follow" recommendations |
| `GET` | `/api/users/:username` | Public | Retrieve user profile, post count, and follower stats |
| `GET` | `/api/users/:username/posts` | Public | Retrieve all posts published by specific user |
| `PUT` | `/api/users/me` | Private | Update user bio, location, website, avatar, and cover |
| `PUT` | `/api/users/:id/follow` | Private | Toggle follow/unfollow (self-follow blocked with 400) |
| `GET` | `/api/users/:id/followers` | Public | Retrieve full follower roster for user |
| `GET` | `/api/users/:id/following` | Public | Retrieve full following roster for user |

### Posts, Likes & Bookmarks (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/feed?page=1` | Private | Chronological feed of followed users + self |
| `POST` | `/api/posts` | Private | Create post (text + optional image file via Multer) |
| `GET` | `/api/posts/:id` | Public | Retrieve single post details |
| `PUT` | `/api/posts/:id` | Private | Edit post text (owner only, 403 otherwise) |
| `DELETE` | `/api/posts/:id` | Private | Delete post & cascade delete comments (owner only) |
| `PUT` | `/api/posts/:id/like` | Private | Toggle like/unlike with optimistic count |
| `PUT` | `/api/posts/:id/bookmark` | Private | Toggle bookmark/saved status on post |
| `GET` | `/api/posts/bookmarks` | Private | Retrieve current user's saved/bookmarked posts |
| `GET` | `/api/posts/trending` | Public | Retrieve trending hashtags across all posts |
| `GET` | `/api/posts/hashtag/:tag` | Public | Retrieve posts filtered by specific hashtag |

### Comments (`/api/posts/:id/comments` & `/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts/:id/comments` | Private | Add comment & dispatch notification |
| `GET` | `/api/posts/:id/comments` | Public | Retrieve comments for post ordered chronologically |
| `DELETE` | `/api/comments/:id` | Private | Delete comment & decrement post count (owner only) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private | Paginated notifications list with unread counter |
| `PUT` | `/api/notifications/read` | Private | Mark all or specific notification as read |

---

## 🧪 8. Automated Testing

ConnectSphere includes 22 automated unit and integration tests using **Jest** and **Supertest**.

Run test suite:
```bash
npm test
```

### Test Coverage Highlights:
- ✅ User registration & JWT generation
- ✅ Duplicate email and username prevention
- ✅ Password hashing verification (`passwordHash` never leaked)
- ✅ Login credential verification & failure branches
- ✅ Token authentication guards (`401 Unauthorized` without Bearer token)
- ✅ Forgot password request with generic anti-enumeration response
- ✅ Password reset token hashing & 15-minute expiration enforcement
- ✅ Post CRUD and validation rules
- ✅ Automatic regex hashtag extraction & query
- ✅ Post bookmarking & saved posts retrieval
- ✅ Trending hashtags aggregation
- ✅ Ownership authorization checks (`403 Forbidden` on unauthorized edits/deletions)
- ✅ Like/unlike toggles & counter accuracy
- ✅ Comment creation & post comment counter synchronization

---

## ☁️ 9. Deployment Guidelines

### 1. Database — MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist `0.0.0.0/0` (or host IP).
3. Copy connection string into `MONGODB_URI` in your production environment.

### 2. Backend — Render / Railway
1. Connect your repository to [Render](https://render.com/).
2. Select **Web Service** with Root Directory set to `server`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables: `NODE_ENV=production`, `PORT=5000`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`.

### 3. Frontend — Vercel / Netlify
1. Connect your repository to [Vercel](https://vercel.com/).
2. Root Directory: `client`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add rewrite rule in `vercel.json` for single-page client routing:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 🔒 10. Security Implementations

- **Helmet**: Secures HTTP response headers against cross-site scripting and sniffing.
- **CORS Whitelist**: Strict origin validation against `CLIENT_URL`.
- **NoSQL Injection Sanitization**: Uses `express-mongo-sanitize` to strip `$` and `.` operators from client inputs.
- **Rate Limiting**: Defends authentication and password reset endpoints from dictionary and brute-force attacks (`authLimiter`, `passwordResetLimiter`).
- **Cryptographic Tokens**: Password reset tokens generated via `crypto.randomBytes(32)` and persisted exclusively as SHA-256 hashes with short 15-minute lifespans.
- **MIME-Type & Size Enforcement**: File uploads restricted strictly to safe image extensions and capped at 5MB.
- **Centralized Error Boundary**: Async error wrapper eliminates unhandled promise rejections and keeps internal stack traces concealed in production.

---

## 📄 License
This project is open-sourced under the MIT License. Developed for the CodeAlpha Full Stack Development Internship.
