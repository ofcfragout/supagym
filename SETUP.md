# SupaGym Setup Guide

Complete step-by-step guide to get SupaGym running on your local machine.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm or yarn package manager
- A GitHub account
- A Supabase account (free tier is sufficient)

## Step 1: Clone the Repository

```bash
git clone https://github.com/ofcfragout/supagym.git
cd supagym
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 19
- Supabase client libraries
- Tailwind CSS
- UI components and utilities

## Step 3: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: SupaGym (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (takes ~2 minutes)

## Step 4: Set Up the Database

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from this repository
4. Copy all the contents and paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" message

This creates:
- All necessary tables (profiles, workouts, exercises, etc.)
- Row Level Security policies
- Database functions and triggers
- Sample exercise data

## Step 5: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
3. Click **"API"** in the settings menu
4. Copy your credentials:
   - **Project URL**: Copy the URL under "Project URL"
   - **Anon Key**: Copy the key under "Project API keys" → "anon public"

5. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control! It's already in `.gitignore`.

## Step 6: Enable Authentication

1. In Supabase dashboard, go to **"Authentication"** → **"Providers"**
2. Enable **"Email"** provider (should be enabled by default)
3. Configure email settings if needed for production

## Step 7: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 8: Create Your First User

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in:
   - Username (unique identifier)
   - Full Name (optional)
   - Email address
   - Password (minimum 6 characters)
4. Click **"Sign Up"**
5. You'll be automatically redirected to the dashboard

## Step 9: Test the Features

### Track a Workout

1. Click **"Workout"** in the navigation
2. Enter a workout title (e.g., "Morning Chest Day")
3. Click **"Start Workout"** to begin timing
4. Click **"Add Exercise"**
5. Select an exercise from the library
6. Enter sets, reps, and weight
7. Add more exercises as needed
8. Click **"Save Workout"**

### Explore Social Features

1. Go to **"Social"** tab
2. See all registered users (if testing alone, create another account in an incognito window)
3. Click **"Follow"** on a user
4. Go back to **"Feed"** to see public workouts

### Check the Leaderboard

1. Click **"Compete"** in the navigation
2. View rankings by workouts, minutes, or calories
3. See your position in the leaderboard

### Update Your Profile

1. Click **"Profile"** in the navigation
2. Click **"Edit Profile"**
3. Update your name and bio
4. Click **"Save"**

## Troubleshooting

### "Invalid API key" Error

- Double-check your `.env.local` file has the correct credentials
- Ensure there are no extra spaces or quotes around the values
- Restart the dev server after changing environment variables

### Database Connection Issues

- Verify your Supabase project is active (not paused)
- Check that the SQL schema was run successfully
- Ensure RLS policies are enabled on all tables

### Location Not Working

- Modern browsers require HTTPS for geolocation (except localhost)
- Click "Allow" when prompted for location permission
- Location is optional - you can still save workouts without it

### Build Errors

- Clear the `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

### Update Supabase Settings for Production

1. In Supabase dashboard, go to **"Authentication"** → **"URL Configuration"**
2. Add your production URL to **"Site URL"**
3. Add your production URL to **"Redirect URLs"**

## Need Help?

- Check the main [README.md](README.md) for feature documentation
- Review the [Supabase Documentation](https://supabase.com/docs)
- Check [Next.js Documentation](https://nextjs.org/docs)
- Open an issue on GitHub for bugs or questions

## Next Steps

Now that you have SupaGym running:

1. **Customize the branding**: Update logos, colors, and text
2. **Add more exercises**: Insert additional exercises into the database
3. **Invite friends**: Share the app with friends to test social features
4. **Monitor usage**: Use Supabase dashboard to track database activity
5. **Deploy to production**: Follow the deployment guide above

Enjoy tracking your fitness journey! 💪
