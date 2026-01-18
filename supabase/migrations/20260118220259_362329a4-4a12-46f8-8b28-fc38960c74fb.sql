-- Create shipment status enum
CREATE TYPE public.shipment_status AS ENUM ('Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered');

-- Create document type enum
CREATE TYPE public.document_type AS ENUM ('Commercial_Invoice', 'Packing_List', 'Bill_of_Lading', 'AWB', 'Other');

-- Create document status enum
CREATE TYPE public.document_status AS ENUM ('Missing', 'Uploaded', 'Approved');

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.shipment_plans(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  status shipment_status NOT NULL DEFAULT 'Planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment_documents table
CREATE TABLE public.shipment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT,
  status document_status NOT NULL DEFAULT 'Missing',
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_documents ENABLE ROW LEVEL SECURITY;

-- Shipments RLS policies
CREATE POLICY "Users can view own shipments"
ON public.shipments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shipments"
ON public.shipments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments"
ON public.shipments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipments"
ON public.shipments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shipments"
ON public.shipments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Shipment documents RLS policies (based on shipment ownership)
CREATE POLICY "Users can view own shipment documents"
ON public.shipment_documents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shipments
  WHERE shipments.id = shipment_documents.shipment_id
  AND shipments.user_id = auth.uid()
));

CREATE POLICY "Users can create own shipment documents"
ON public.shipment_documents FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.shipments
  WHERE shipments.id = shipment_documents.shipment_id
  AND shipments.user_id = auth.uid()
));

CREATE POLICY "Users can update own shipment documents"
ON public.shipment_documents FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.shipments
  WHERE shipments.id = shipment_documents.shipment_id
  AND shipments.user_id = auth.uid()
));

CREATE POLICY "Users can delete own shipment documents"
ON public.shipment_documents FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.shipments
  WHERE shipments.id = shipment_documents.shipment_id
  AND shipments.user_id = auth.uid()
));

CREATE POLICY "Admins can view all shipment documents"
ON public.shipment_documents FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipment_documents_updated_at
BEFORE UPDATE ON public.shipment_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for shipment documents
INSERT INTO storage.buckets (id, name, public) VALUES ('shipment-documents', 'shipment-documents', false);

-- Storage policies
CREATE POLICY "Users can upload own shipment documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shipment-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own shipment documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'shipment-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own shipment documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shipment-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own shipment documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shipment-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);