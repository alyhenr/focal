-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table extensions (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'trial')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- North Star Goals
CREATE TABLE IF NOT EXISTS public.north_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0
);

-- Focus Sessions (multiple per day allowed)
CREATE TABLE IF NOT EXISTS public.focuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  north_star_id UUID REFERENCES public.north_stars(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkpoints (subtasks)
CREATE TABLE IF NOT EXISTS public.checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_id UUID REFERENCES public.focuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Later List Items
CREATE TABLE IF NOT EXISTS public.later_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT CHECK (action_taken IN ('converted', 'archived', 'deleted'))
);

-- Timer Sessions
CREATE TABLE IF NOT EXISTS public.timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_id UUID REFERENCES public.focuses(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  was_completed BOOLEAN DEFAULT FALSE,
  session_type TEXT CHECK (session_type IN ('work', 'break'))
);

-- Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_focus_date DATE,
  total_focuses_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events (for custom tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focuses_user_date ON public.focuses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_focuses_completed ON public.focuses(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_checkpoints_focus ON public.checkpoints(focus_id, display_order);
CREATE INDEX IF NOT EXISTS idx_later_items_user_date ON public.later_items(user_id, date);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_focus ON public.timer_sessions(focus_id);
CREATE INDEX IF NOT EXISTS idx_north_stars_user ON public.north_stars(user_id, display_order);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.north_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.later_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- North Stars: Users can only manage their own goals
CREATE POLICY "Users can view own goals" ON public.north_stars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.north_stars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.north_stars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.north_stars
  FOR DELETE USING (auth.uid() = user_id);

-- Focuses: Users can only manage their own focus sessions
CREATE POLICY "Users can view own focuses" ON public.focuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focuses" ON public.focuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focuses" ON public.focuses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own focuses" ON public.focuses
  FOR DELETE USING (auth.uid() = user_id);

-- Checkpoints: Users can manage checkpoints for their focuses
CREATE POLICY "Users can view checkpoints" ON public.checkpoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = checkpoints.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert checkpoints" ON public.checkpoints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = checkpoints.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checkpoints" ON public.checkpoints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = checkpoints.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checkpoints" ON public.checkpoints
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = checkpoints.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

-- Later Items: Users can only manage their own items
CREATE POLICY "Users can view own later items" ON public.later_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own later items" ON public.later_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own later items" ON public.later_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own later items" ON public.later_items
  FOR DELETE USING (auth.uid() = user_id);

-- Timer Sessions: Users can manage timer sessions for their focuses
CREATE POLICY "Users can view timer sessions" ON public.timer_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = timer_sessions.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timer sessions" ON public.timer_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = timer_sessions.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update timer sessions" ON public.timer_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.focuses
      WHERE focuses.id = timer_sessions.focus_id
      AND focuses.user_id = auth.uid()
    )
  );

-- Streaks: Users can only see and update their own streak
CREATE POLICY "Users can view own streak" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics Events: Users can only manage their own events
CREATE POLICY "Users can view own events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get or create today's session number
CREATE OR REPLACE FUNCTION public.get_next_session_number(p_user_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
  v_max_session INTEGER;
BEGIN
  SELECT COALESCE(MAX(session_number), 0) INTO v_max_session
  FROM public.focuses
  WHERE user_id = p_user_id AND date = p_date;

  RETURN v_max_session + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak on focus completion
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Only update on completion
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    SELECT last_focus_date, current_streak, longest_streak
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM public.streaks
    WHERE user_id = NEW.user_id;

    IF v_last_date IS NULL THEN
      -- First focus ever
      INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_focus_date, total_focuses_completed)
      VALUES (NEW.user_id, 1, 1, NEW.date, 1)
      ON CONFLICT (user_id) DO UPDATE
      SET current_streak = 1, longest_streak = 1, last_focus_date = NEW.date, total_focuses_completed = 1;
    ELSIF v_last_date = NEW.date THEN
      -- Same day, just increment total
      UPDATE public.streaks
      SET total_focuses_completed = total_focuses_completed + 1
      WHERE user_id = NEW.user_id;
    ELSIF v_last_date = NEW.date - INTERVAL '1 day' THEN
      -- Consecutive day
      v_current_streak := v_current_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_current_streak);

      UPDATE public.streaks
      SET current_streak = v_current_streak,
          longest_streak = v_longest_streak,
          last_focus_date = NEW.date,
          total_focuses_completed = total_focuses_completed + 1
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken
      UPDATE public.streaks
      SET current_streak = 1,
          last_focus_date = NEW.date,
          total_focuses_completed = total_focuses_completed + 1
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak updates
DROP TRIGGER IF EXISTS on_focus_completed ON public.focuses;
CREATE TRIGGER on_focus_completed
  AFTER UPDATE ON public.focuses
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();