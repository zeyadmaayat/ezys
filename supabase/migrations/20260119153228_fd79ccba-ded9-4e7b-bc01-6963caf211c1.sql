-- Create cost_type enum
CREATE TYPE public.cost_type AS ENUM ('Freight', 'Customs', 'Clearance', 'Insurance', 'LastMile', 'Storage', 'Other');

-- Create task_status enum
CREATE TYPE public.task_status AS ENUM ('Pending', 'Done');

-- Create shipment_costs table
CREATE TABLE public.shipment_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  cost_type public.cost_type NOT NULL,
  estimate_amount NUMERIC(12, 2),
  actual_amount NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  vendor_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment_tasks table
CREATE TABLE public.shipment_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status public.task_status NOT NULL DEFAULT 'Pending',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for shipment_costs
CREATE POLICY "Users can view own shipment costs"
ON public.shipment_costs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shipment costs"
ON public.shipment_costs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipment costs"
ON public.shipment_costs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipment costs"
ON public.shipment_costs FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shipment costs"
ON public.shipment_costs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for shipment_tasks
CREATE POLICY "Users can view own shipment tasks"
ON public.shipment_tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shipment tasks"
ON public.shipment_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipment tasks"
ON public.shipment_tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipment tasks"
ON public.shipment_tasks FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shipment tasks"
ON public.shipment_tasks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_shipment_costs_updated_at
BEFORE UPDATE ON public.shipment_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_tasks_updated_at
BEFORE UPDATE ON public.shipment_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();