-- Create shipment_plans table for saving user shipment data
CREATE TABLE public.shipment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  shipment_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_plan TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipment_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own shipment plans"
ON public.shipment_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shipment plans"
ON public.shipment_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipment plans"
ON public.shipment_plans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipment plans"
ON public.shipment_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all plans
CREATE POLICY "Admins can view all shipment plans"
ON public.shipment_plans
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipment_plans_updated_at
BEFORE UPDATE ON public.shipment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();