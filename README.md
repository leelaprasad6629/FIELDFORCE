# FieldForce 360

Intelligent field service management dashboard built with Next.js 14, TypeScript, Tailwind CSS, Clerk authentication, and MongoDB.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk (`@clerk/nextjs`)
- **Database:** MongoDB + Mongoose
- **Deployment:** Vercel

## Getting Started (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and fill in your values:

```bash
cp .env.local .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `MONGODB_URI` | MongoDB Atlas connection string |

### 3. Seed the database (development)

Start the dev server, then visit:

```
http://localhost:3000/api/seed
```

This inserts 3 technicians, 5 tasks, and 5 alerts. The seed endpoint is disabled in production.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/sign-in` to access the protected `/dashboard`.

## API Routes

| Route | Methods | Description |
|---|---|---|
| `/api/technicians` | GET, POST | List / create technicians |
| `/api/tasks` | GET, POST | List / create tasks |
| `/api/alerts` | GET | Last 10 alerts |
| `/api/stats` | GET | Dashboard KPIs |
| `/api/seed` | GET | Seed sample data (dev only) |

## Deploy to Vercel

### Step 1 — Push to GitHub

Ensure your project is in a GitHub repository and pushed to the remote.

### Step 2 — Import the project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — keep the default build settings:
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### Step 3 — Add environment variables

In the Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
MONGODB_URI=your_mongodb_connection_string
```

3. Click **Save**

### Step 4 — Configure Clerk for production

In the [Clerk Dashboard](https://dashboard.clerk.com):

1. Add your Vercel production URL (e.g. `https://your-app.vercel.app`) to allowed origins
2. Confirm sign-in/sign-up redirect URLs match the env variables above

### Step 5 — Configure MongoDB Atlas

In [MongoDB Atlas](https://cloud.mongodb.com):

1. Add `0.0.0.0/0` (or Vercel IP ranges) to **Network Access** so Vercel can connect
2. Use a database user with read/write access
3. Include the database name in the connection string, e.g.:
   `mongodb+srv://user:password@cluster.mongodb.net/fieldforce?retryWrites=true&w=majority`

### Step 6 — Deploy

Click **Deploy** in Vercel (or push to `main` to trigger automatic deployment).

After deployment:

1. Visit your production URL
2. Sign up / sign in via Clerk
3. Seed data manually via MongoDB Compass or a one-time script (the `/api/seed` route is blocked in production)

## Project Structure

```
app/
  sign-in/          Clerk sign-in page
  sign-up/          Clerk sign-up page
  (main)/dashboard/ Protected dashboard
  api/              REST API routes
components/         UI components
lib/                MongoDB connection & seed script
models/             Mongoose schemas
middleware.ts       Clerk route protection
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
