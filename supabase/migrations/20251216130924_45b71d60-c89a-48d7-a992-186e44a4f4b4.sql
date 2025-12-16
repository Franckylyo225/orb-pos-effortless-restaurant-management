-- Create table to track login attempts
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS but allow public access for auth operations
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for login attempt tracking (needed before auth)
CREATE POLICY "Allow public read for login attempts"
ON public.login_attempts
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert for login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for login attempts"
ON public.login_attempts
FOR UPDATE
USING (true);

-- Function to record a failed login attempt
CREATE OR REPLACE FUNCTION public.record_failed_login(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := '15 minutes';
  current_attempts INTEGER;
  lock_time TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Insert or update attempt record
  INSERT INTO public.login_attempts (email, attempt_count, last_attempt_at)
  VALUES (user_email, 1, now())
  ON CONFLICT (email) DO UPDATE
  SET 
    attempt_count = CASE 
      WHEN login_attempts.locked_until IS NOT NULL AND login_attempts.locked_until < now() THEN 1
      ELSE login_attempts.attempt_count + 1
    END,
    last_attempt_at = now(),
    locked_until = CASE 
      WHEN login_attempts.attempt_count + 1 >= max_attempts THEN now() + lockout_duration
      ELSE login_attempts.locked_until
    END
  RETURNING attempt_count, locked_until INTO current_attempts, lock_time;

  result := json_build_object(
    'attempts', current_attempts,
    'max_attempts', max_attempts,
    'locked', current_attempts >= max_attempts,
    'locked_until', lock_time
  );

  RETURN result;
END;
$$;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_locked(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lock_time TIMESTAMP WITH TIME ZONE;
  attempts INTEGER;
  max_attempts INTEGER := 5;
BEGIN
  SELECT locked_until, attempt_count INTO lock_time, attempts
  FROM public.login_attempts
  WHERE email = user_email;

  -- No record found = not locked
  IF NOT FOUND THEN
    RETURN json_build_object('locked', false, 'attempts', 0, 'max_attempts', max_attempts);
  END IF;

  -- Check if lock has expired
  IF lock_time IS NOT NULL AND lock_time > now() THEN
    RETURN json_build_object(
      'locked', true, 
      'locked_until', lock_time,
      'attempts', attempts,
      'max_attempts', max_attempts,
      'remaining_minutes', EXTRACT(EPOCH FROM (lock_time - now())) / 60
    );
  END IF;

  RETURN json_build_object('locked', false, 'attempts', attempts, 'max_attempts', max_attempts);
END;
$$;

-- Function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE email = user_email;
END;
$$;