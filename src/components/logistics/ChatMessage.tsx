import { cn } from '@/lib/utils';
import { User, Bot, FileDown, FileText } from 'lucide-react';
import { ShipmentPlanRenderer } from './ShipmentPlanRenderer';
import { parseDocumentFromMessage, generateShippingDocumentPDF, downloadPDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  shipmentId?: string;
}

export function ChatMessage({ role, content, shipmentId }: ChatMessageProps) {
  const isUser = role === 'user';
  const [saving, setSaving] = useState(false);
  
  // Check for shipment plan JSON
  const hasShipmentPlan = content.includes('"shipment_summary"') && content.includes('"recommended_shipping_options"');
  
  // Check for document JSON
  const documentData = !isUser ? parseDocumentFromMessage(content) : null;
  
  // Get text content without the document block
  const textContent = documentData 
    ? content.replace(/```document[\s\S]*?```/, '').trim()
    : content;

  const handleDownloadPDF = () => {
    if (!documentData) return;
    const pdf = generateShippingDocumentPDF(documentData);
    const filename = `${documentData.document_type}_${documentData.document_number || 'draft'}.pdf`;
    downloadPDF(pdf, filename);
  };

  const handleSaveToShipment = async () => {
    if (!documentData || !shipmentId) return;
    setSaving(true);
    try {
      // Map document type to shipment document type
      const typeMap: Record<string, string> = {
        'commercial_invoice': 'Commercial_Invoice',
        'packing_list': 'Packing_List',
        'bill_of_lading': 'Bill_of_Lading',
        'awb': 'AWB',
        'customs_declaration': 'Other',
      };
      
      const docType = typeMap[documentData.document_type] || 'Other';
      
      // Generate PDF blob and upload
      const pdf = generateShippingDocumentPDF(documentData);
      const pdfBlob = pdf.output('blob');
      const filename = `${shipmentId}/${documentData.document_type}_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('shipment-documents')
        .upload(filename, pdfBlob, { contentType: 'application/pdf' });
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('shipment-documents')
        .getPublicUrl(filename);

      // Create document record
      const { error: docError } = await supabase
        .from('shipment_documents')
        .insert([{
          shipment_id: shipmentId,
          document_type: docType as 'Commercial_Invoice' | 'Packing_List' | 'Bill_of_Lading' | 'AWB' | 'Other',
          status: 'Uploaded' as const,
          file_url: urlData.publicUrl,
          uploaded_at: new Date().toISOString(),
        }]);

      if (docError) throw docError;
      toast.success('Document saved to shipment!');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn(
      'flex gap-3 px-4 py-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      {/* Content */}
      <div className={cn('max-w-[85%] space-y-3', isUser ? 'text-right' : 'text-left')}>
        {/* Text bubble */}
        {textContent && !hasShipmentPlan && (
          <div className={cn(
            'rounded-2xl px-4 py-3 inline-block text-left',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}>
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{textContent}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>{textContent}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Shipment Plan */}
        {hasShipmentPlan && (
          <div className="max-w-full">
            <ShipmentPlanRenderer content={content} />
          </div>
        )}

        {/* Document Card */}
        {documentData && (
          <div className="bg-card border rounded-xl p-4 space-y-3 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{documentData.document_title}</p>
                <p className="text-xs text-muted-foreground">
                  {documentData.document_number} • {documentData.date}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">PDF</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="default"
                className="flex-1 gap-2"
                onClick={handleDownloadPDF}
              >
                <FileDown className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              {shipmentId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleSaveToShipment}
                  disabled={saving}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {saving ? 'Saving...' : 'Save to Shipment'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
