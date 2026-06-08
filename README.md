# KindLink — Full-Stack Donation Platform

**KindLink** connects kind donors with people in need — direct, verified, one-to-one. No middleman.

A full-stack React + Express application for transparent donor-to-receiver fund transfers.

## Architecture

```
universal-donation-platform/
├── server/                 # Express API + SQLite database
│   ├── index.js            # Server entry point
│   ├── db.js               # Database setup & seeding
│   ├── middleware/         # JWT auth middleware
│   └── routes/             # API routes (auth, users, posts, messages, transactions)
├── src/                    # React frontend (Vite)
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/           # API client (fetch + JWT)
│   └── styles/
└── package.json
```

## Features

- **JWT Authentication** — secure login/register with bcrypt password hashing
- **Admin Verification** — approve or block user registrations
- **SOP Posts** — create donation/reception posts by area of interest
- **Smart Matching** — find compatible donors/receivers
- **Real-time Messaging** — one-to-one private chat
- **Payment Gateway** — simulated direct transfers with transaction logging
- **SQLite Database** — persistent data storage (no external DB needed)
- **Profile Management** — update user details

## Getting Started

### Prerequisites

- Node.js 18+

### Install & Run (Full Stack)

```bash
cd universal-donation-platform
npm install
npm run dev
```

This starts **both** the API server (`http://localhost:3001`) and the React app (`http://localhost:5173`) concurrently.

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build    # Build React frontend
npm start        # Start server (serves API + built frontend)
```

## Demo Accounts

| Role     | Email                     | Password  |
|----------|---------------------------|-----------|
| Admin    | admin@kindlink.com        | admin123  |
| Donor    | sarah@example.com         | demo123   |
| Receiver | michael@example.com       | demo123   |

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/auth/register`            | Register new user        |
| POST   | `/api/auth/login`               | Login (returns JWT)      |
| GET    | `/api/auth/me`                  | Get current user         |
| GET    | `/api/posts`                    | List all posts           |
| GET    | `/api/posts/matches`            | Get matched posts        |
| POST   | `/api/posts`                    | Create post              |
| GET    | `/api/messages/conversations`   | List conversations       |
| POST   | `/api/messages`                 | Send message             |
| POST   | `/api/transactions/pay`         | Process payment          |
| PATCH  | `/api/users/:id/status`         | Admin: approve/block     |

## Tech Stack

- **Frontend:** React 19, Vite, React Router, Lucide Icons
- **Backend:** Express 5, better-sqlite3, JWT, bcryptjs
- **Database:** SQLite (file-based, auto-created in `server/data/`)
