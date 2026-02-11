
CREATE TABLE public.training_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ratings"
ON public.training_ratings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
ON public.training_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.training_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_training_ratings_user ON public.training_ratings(user_id);
CREATE INDEX idx_training_ratings_plan ON public.training_ratings(plan_id);
