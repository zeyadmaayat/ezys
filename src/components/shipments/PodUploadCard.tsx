/**
 * POD Upload Card Component
 * 
 * TODO: This component is scaffolded but not yet integrated into the UI.
 * Enable it in ShipmentDetail.tsx once the ERP workflow is fully tested.
 * 
 * Features:
 * - Upload POD image (photo of signed delivery receipt)
 * - Capture receiver name
 * - Add delivery notes
 * - Text signature field
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { usePodUpload } from '@/hooks/usePodUpload';

interface PodUploadCardProps {
  shipmentId: string;
  onSuccess?: () => void;
}

export function PodUploadCard({ shipmentId, onSuccess }: PodUploadCardProps) {
  const { uploading, submitPod } = usePodUpload();
  
  const [file, setFile] = useState<File | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload an image (JPEG, PNG, WebP) or PDF file.');
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!receiverName.trim()) {
      alert('Please enter the receiver name.');
      return;
    }

    const success = await submitPod(shipmentId, file, {
      pod_receiver_name: receiverName,
      pod_signature: signature || undefined,
      pod_notes: notes || undefined,
    });

    if (success) {
      setSubmitted(true);
      onSuccess?.();
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-lg font-medium">POD Submitted Successfully</p>
            <p className="text-sm text-muted-foreground">
              Delivery confirmed for {receiverName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Proof of Delivery
        </CardTitle>
        <CardDescription>
          Upload delivery proof and capture receiver details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receiver Name */}
        <div className="space-y-2">
          <Label htmlFor="receiver-name">Receiver Name *</Label>
          <Input
            id="receiver-name"
            placeholder="Enter the name of the person who received the delivery"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="pod-file">Upload Image/PDF</Label>
          <Input
            id="pod-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Signature (text-based) */}
        <div className="space-y-2">
          <Label htmlFor="signature">Signature (Type Name)</Label>
          <Input
            id="signature"
            placeholder="Type receiver's signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Delivery Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes about the delivery..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={uploading || !receiverName.trim()}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Delivery
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
