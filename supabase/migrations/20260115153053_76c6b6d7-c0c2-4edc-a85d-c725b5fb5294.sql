-- Create action_plans table for user-created training scenarios
CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  estimated_time_en TEXT,
  estimated_time_ar TEXT,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own action plans
CREATE POLICY "Users can view own action plans"
ON public.action_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own action plans
CREATE POLICY "Users can create own action plans"
ON public.action_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own action plans
CREATE POLICY "Users can update own action plans"
ON public.action_plans
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own action plans
CREATE POLICY "Users can delete own action plans"
ON public.action_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all action plans
CREATE POLICY "Admins can view all action plans"
ON public.action_plans
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_action_plans_updated_at
BEFORE UPDATE ON public.action_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();