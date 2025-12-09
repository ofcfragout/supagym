# SupaGym 💪

A modern, social gym tracking application built with Next.js 14 and Supabase. Track your workouts, compete with friends, and achieve your fitness goals!

## ✨ Features

- **🏋️ Workout Tracking**: Log exercises with detailed stats (sets, reps, weight), view exercise demonstrations
- **📱 Mobile-Friendly**: Responsive design optimized for mobile devices with bottom navigation
- **👥 Social Feed**: Share workouts publicly, keep them private, or share with specific friends
- **🏆 Competition**: Leaderboards to compete with other users on workouts, minutes, and calories
- **👤 User Profiles**: Manage your profile, view stats, and track your progress
- **🔒 Privacy Controls**: Choose visibility for each workout (public, private, friends-only)
- **📍 Location Tracking**: Automatically track location and time statistics
- **⏱️ Timer**: Built-in workout timer to track session duration
- **💬 Social Features**: Like workouts, follow users, view followers and following

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router and TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/ofcfragout/supagym.git
cd supagym
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase project dashboard, go to **SQL Editor**
3. Copy the contents of `supabase/schema.sql` and run it in the SQL Editor
   - This will create all necessary tables, policies, and functions
   - Sample exercises will be automatically inserted

### 4. Configure environment variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings under **API**.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📱 Usage

### First Time Setup

1. **Sign Up**: Create an account at `/signup`
2. **Complete Profile**: Add your name and bio in the Profile section
3. **Start Tracking**: Go to the Workout tab to log your first workout

### Tracking a Workout

1. Click **Workout** in the navigation
2. Enter workout title and description
3. Choose privacy setting (Public/Private/Friends)
4. Click **Start Workout** to begin timer
5. Add exercises using the **Add Exercise** button
6. For each exercise, enter sets, reps, and weight
7. Click **Save Workout** when done

### Social Features

- **Feed**: View public workouts from all users
- **Like**: Click the heart icon on any workout
- **Follow**: Go to Social tab to find and follow users
- **Compete**: Check the Leaderboard to see rankings

## 🗂️ Project Structure

```
supagym/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── workout/        # Workout tracking
│   │   ├── profile/        # User profile
│   │   ├── leaderboard/    # Competition rankings
│   │   └── social/         # Social connections
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   ├── workout/            # Workout-related components
│   ├── feed/               # Feed components
│   ├── profile/            # Profile components
│   ├── leaderboard/        # Leaderboard components
│   └── social/             # Social components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase client configuration
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── supabase/               # Supabase configuration
│   └── schema.sql          # Database schema
└── public/                 # Static assets
```

## 🔐 Database Schema

Key tables:
- **profiles**: User profiles (extends Supabase auth.users)
- **exercises**: Exercise library with instructions
- **workouts**: User workout sessions
- **workout_exercises**: Junction table linking workouts and exercises
- **follows**: Social following relationships
- **likes**: Workout likes
- **comments**: Workout comments
- **workout_shares**: Private workout sharing

All tables have Row Level Security (RLS) policies to ensure data privacy.

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
