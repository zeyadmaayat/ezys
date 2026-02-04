import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PodFields {
  pod_receiver_name?: string;
  pod_signature?: string;
  pod_notes?: string;
  pod_image_url?: string;
}

export function usePodUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  /**
   * Upload a POD image to storage and return the public URL.
   * Files are stored under {user_id}/{shipment_id}/{filename}
   */
  const uploadPodImage = async (
    file: File,
    shipmentId: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${shipmentId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('pod')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('POD upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return null;
      }

      // Get signed URL (since bucket is private)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('pod')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        toast.error('Failed to get file URL');
        return null;
      }

      return signedUrlData.signedUrl;
    } catch (error) {
      console.error('Error uploading POD:', error);
      toast.error('Failed to upload POD image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Update the POD fields on a shipment record.
   */
  const updateShipmentPodFields = async (
    shipmentId: string,
    fields: PodFields
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          ...fields,
          actual_delivery_at: fields.pod_receiver_name ? new Date().toISOString() : undefined,
        })
        .eq('id', shipmentId);

      if (error) {
        console.error('Error updating POD fields:', error);
        toast.error(`Failed to update POD: ${error.message}`);
        return false;
      }

      toast.success('POD updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating shipment POD:', error);
      toast.error('Failed to update POD');
      return false;
    }
  };

  /**
   * Full POD submission: upload image + update shipment record.
   */
  const submitPod = async (
    shipmentId: string,
    file: File | null,
    fields: Omit<PodFields, 'pod_image_url'>
  ): Promise<boolean> => {
    let imageUrl: string | null = null;

    // Upload image if provided
    if (file) {
      imageUrl = await uploadPodImage(file, shipmentId);
      if (!imageUrl) return false;
    }

    // Update shipment with POD fields
    return updateShipmentPodFields(shipmentId, {
      ...fields,
      ...(imageUrl ? { pod_image_url: imageUrl } : {}),
    });
  };

  return {
    uploading,
    uploadPodImage,
    updateShipmentPodFields,
    submitPod,
  };
}
