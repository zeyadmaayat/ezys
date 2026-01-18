import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DocumentType = 'Commercial_Invoice' | 'Packing_List' | 'Bill_of_Lading' | 'AWB' | 'Other';
export type DocumentStatus = 'Missing' | 'Uploaded' | 'Approved';

export interface ShipmentDocument {
  id: string;
  shipment_id: string;
  document_type: DocumentType;
  file_url: string | null;
  status: DocumentStatus;
  uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  Commercial_Invoice: 'Commercial Invoice',
  Packing_List: 'Packing List',
  Bill_of_Lading: 'Bill of Lading',
  AWB: 'Air Waybill (AWB)',
  Other: 'Other',
};

export function useShipmentDocuments(shipmentId: string | undefined) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    if (!shipmentId || !user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shipment_documents')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setDocuments((data || []).map(d => ({
        ...d,
        document_type: d.document_type as DocumentType,
        status: d.status as DocumentStatus,
      })));
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    documentId: string,
    file: File
  ): Promise<boolean> => {
    if (!user || !shipmentId) {
      toast.error('You must be logged in');
      return false;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${shipmentId}/${documentId}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('shipment-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shipment-documents')
        .getPublicUrl(fileName);

      // Update document record
      const { error: updateError } = await supabase
        .from('shipment_documents')
        .update({
          file_url: urlData.publicUrl,
          status: 'Uploaded' as DocumentStatus,
          uploaded_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      toast.success('Document uploaded successfully');
      await fetchDocuments();
      return true;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentStatus = async (
    documentId: string,
    status: DocumentStatus
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shipment_documents')
        .update({ status })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(d => (d.id === documentId ? { ...d, status } : d))
      );

      toast.success('Document status updated');
      return true;
    } catch (error: any) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update status');
      return false;
    }
  };

  const addDocument = async (documentType: DocumentType): Promise<boolean> => {
    if (!shipmentId) return false;

    try {
      const { error } = await supabase
        .from('shipment_documents')
        .insert({
          shipment_id: shipmentId,
          document_type: documentType,
          status: 'Missing' as DocumentStatus,
        });

      if (error) throw error;

      toast.success('Document added');
      await fetchDocuments();
      return true;
    } catch (error: any) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
      return false;
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shipment_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success('Document removed');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to remove document');
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [shipmentId, user]);

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocumentStatus,
    addDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
