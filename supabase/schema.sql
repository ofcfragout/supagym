-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table (library of exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  image_url TEXT,
  video_url TEXT,
  instructions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'private', 'friends')) DEFAULT 'public',
  duration_minutes INTEGER,
  calories_burned INTEGER,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_name TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises junction table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  weight DOUBLE PRECISION,
  duration_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create follows table for social features
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, workout_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_shares table for sharing with specific users
CREATE TABLE IF NOT EXISTS public.workout_shares (
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workout_id, shared_with_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_visibility ON public.workouts(visibility);
CREATE INDEX IF NOT EXISTS idx_workouts_started_at ON public.workouts(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_workout_id ON public.likes(workout_id);
CREATE INDEX IF NOT EXISTS idx_comments_workout_id ON public.comments(workout_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for exercises (read-only for all authenticated users)
CREATE POLICY "Exercises are viewable by authenticated users" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for workouts
CREATE POLICY "Public workouts are viewable by everyone" ON public.workouts
  FOR SELECT USING (
    visibility = 'public' 
    OR user_id = auth.uid()
    OR (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() AND following_id = user_id
    ))
    OR EXISTS (
      SELECT 1 FROM public.workout_shares 
      WHERE workout_id = id AND shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_exercises
CREATE POLICY "Workout exercises are viewable with parent workout" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.follows 
          WHERE follower_id = auth.uid() AND following_id = user_id
        ))
        OR EXISTS (
          SELECT 1 FROM public.workout_shares 
          WHERE workout_id = workouts.id AND shared_with_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert exercises for their own workouts" ON public.workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises for their own workouts" ON public.workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises for their own workouts" ON public.workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like workouts" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike workouts" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable with parent workout" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.follows 
          WHERE follower_id = auth.uid() AND following_id = user_id
        ))
      )
    )
  );

CREATE POLICY "Users can comment on visible workouts" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND (
        visibility = 'public' 
        OR (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.follows 
          WHERE follower_id = auth.uid() AND following_id = workouts.user_id
        ))
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_shares
CREATE POLICY "Workout shares are viewable by the shared user" ON public.workout_shares
  FOR SELECT USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Workout owners can share their workouts" ON public.workout_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Workout owners can unshare their workouts" ON public.workout_shares
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample exercises
INSERT INTO public.exercises (name, description, muscle_group, equipment, difficulty, instructions) VALUES
  ('Push-ups', 'Classic bodyweight exercise for chest and arms', 'Chest', 'None', 'beginner', ARRAY['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position']),
  ('Squats', 'Fundamental lower body exercise', 'Legs', 'None', 'beginner', ARRAY['Stand with feet shoulder-width apart', 'Lower body by bending knees', 'Push through heels to return to standing']),
  ('Bench Press', 'Classic chest exercise with barbell', 'Chest', 'Barbell', 'intermediate', ARRAY['Lie on bench with feet flat on floor', 'Grip barbell slightly wider than shoulders', 'Lower bar to chest', 'Press back up to starting position']),
  ('Deadlift', 'Compound exercise for posterior chain', 'Back', 'Barbell', 'intermediate', ARRAY['Stand with feet hip-width apart', 'Grip barbell with hands outside legs', 'Keep back straight and lift bar by extending hips', 'Lower bar back to ground with control']),
  ('Pull-ups', 'Upper body pulling exercise', 'Back', 'Pull-up Bar', 'intermediate', ARRAY['Hang from bar with palms facing away', 'Pull body up until chin is over bar', 'Lower back down with control']),
  ('Plank', 'Core stability exercise', 'Core', 'None', 'beginner', ARRAY['Start in forearm plank position', 'Keep body in straight line', 'Hold position for time']),
  ('Lunges', 'Single-leg lower body exercise', 'Legs', 'None', 'beginner', ARRAY['Step forward with one leg', 'Lower hips until both knees are at 90 degrees', 'Push back to starting position', 'Repeat with other leg']),
  ('Dumbbell Rows', 'Back exercise with dumbbells', 'Back', 'Dumbbells', 'beginner', ARRAY['Bend at hips with dumbbell in one hand', 'Pull dumbbell to hip', 'Lower with control', 'Repeat and switch sides'])
ON CONFLICT DO NOTHING;
