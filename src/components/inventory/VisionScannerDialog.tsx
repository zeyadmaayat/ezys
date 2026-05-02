import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Upload, X, Check, AlertTriangle, MapPin, Package, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVisionScanner, type ScanType, type VisionResult } from '@/hooks/useVisionScanner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ScanType;
  onAction?: (action: 'add' | 'avoid' | 'place_on_shelf', result: VisionResult) => void | Promise<void>;
}

export function VisionScannerDialog({ open, onOpenChange, defaultType = 'product', onAction }: Props) {
  const { language } = useLanguage();
  const { scan, scanning, result, reset } = useVisionScanner();
  const [scanType, setScanType] = useState<ScanType>(defaultType);
  const [image, setImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Start camera when opened in camera mode
  useEffect(() => {
    if (!open || mode !== 'camera' || image) return;
    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) { s.getTracks().forEach(t => t.stop()); return; }
        setStream(s);
        if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      } catch {
        toast.error(language === 'ar' ? 'تعذر الوصول للكاميرا' : 'Cannot access camera');
        setMode('upload');
      }
    })();
    return () => { active = false; };
  }, [open, mode, image, language]);

  // Cleanup
  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const handleClose = () => {
    stream?.getTracks().forEach(t => t.stop()); setStream(null);
    setImage(null); reset(); onOpenChange(false);
  };

  const capture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImage(dataUrl);
    stream?.getTracks().forEach(t => t.stop()); setStream(null);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    // Optional: upload image to storage
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const blob = await (await fetch(image)).blob();
        const path = `${user.id}/${Date.now()}.jpg`;
        await supabase.storage.from('vision-scans').upload(path, blob, { contentType: 'image/jpeg' });
      }
    } catch { /* non-fatal */ }
    await scan(image, scanType, language);
  };

  const retake = () => { setImage(null); reset(); if (mode === 'camera') { /* effect re-init */ } };

  const handleAction = async (action: 'add' | 'avoid' | 'place_on_shelf') => {
    if (!result || !onAction) return;
    await onAction(action, result);
    toast.success(
      action === 'add' ? (language === 'ar' ? 'تمت الإضافة للمخزون' : 'Added to inventory')
      : action === 'place_on_shelf' ? (language === 'ar' ? 'تم وضعه على الرف' : 'Placed on shelf')
      : (language === 'ar' ? 'تم التجاهل' : 'Avoided')
    );
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {language === 'ar' ? 'الماسح الذكي بالكاميرا' : 'AI Vision Scanner'}
          </DialogTitle>
        </DialogHeader>

        {!image && !result && (
          <>
            <Tabs value={scanType} onValueChange={(v) => setScanType(v as ScanType)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="product">{language === 'ar' ? 'منتج' : 'Product'}</TabsTrigger>
                <TabsTrigger value="invoice">{language === 'ar' ? 'فاتورة' : 'Invoice'}</TabsTrigger>
                <TabsTrigger value="document">{language === 'ar' ? 'مستند' : 'Document'}</TabsTrigger>
                <TabsTrigger value="shipment_label">{language === 'ar' ? 'شحنة' : 'Label'}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'camera' | 'upload')} className="mt-2">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="camera"><Camera className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'كاميرا' : 'Camera'}</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'رفع' : 'Upload'}</TabsTrigger>
              </TabsList>
              <TabsContent value="camera">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                </div>
                <Button onClick={capture} className="w-full mt-3" size="lg">
                  <Camera className="w-5 h-5 mr-2" />{language === 'ar' ? 'التقط الصورة' : 'Capture'}
                </Button>
              </TabsContent>
              <TabsContent value="upload">
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/30 transition">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">{language === 'ar' ? 'اضغط لاختيار صورة' : 'Click to choose image'}</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              </TabsContent>
            </Tabs>
          </>
        )}

        {image && !result && (
          <div className="space-y-3">
            <img src={image} alt="captured" className="w-full rounded-lg max-h-[400px] object-contain bg-muted" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={retake} className="flex-1" disabled={scanning}>
                <RefreshCw className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'إعادة' : 'Retake'}
              </Button>
              <Button onClick={analyze} className="flex-1" disabled={scanning}>
                {scanning ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                {scanning ? (language === 'ar' ? 'جاري التحليل...' : 'Analyzing...') : (language === 'ar' ? 'حلّل بالـ AI' : 'Analyze with AI')}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {image && <img src={image} alt="" className="w-full rounded-lg max-h-[200px] object-contain bg-muted" />}

            {scanType === 'product' && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  {result.detected ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم التعرف على' : 'Identified'}</p>
                          <p className="font-bold text-lg">{result.matched_item_name || '—'}</p>
                          {result.matched_item_sku && <Badge variant="secondary" className="font-mono text-xs mt-1">{result.matched_item_sku}</Badge>}
                        </div>
                        {result.confidence !== undefined && (
                          <Badge variant={result.confidence > 70 ? 'default' : 'secondary'}>{result.confidence}% {language === 'ar' ? 'ثقة' : 'confidence'}</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-background rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الكمية المكتشفة' : 'Detected Qty'}</p>
                          <p className="font-bold tabular-nums">{result.detected_quantity ?? '—'}</p>
                        </div>
                        <div className="bg-background rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المخزون الحالي' : 'On Hand'}</p>
                          <p className="font-bold tabular-nums">{result.total_quantity_on_hand ?? 0}</p>
                        </div>
                      </div>

                      {result.suggested_location_name && (
                        <div className="flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg p-2">
                          <MapPin className="w-4 h-4" />
                          <span>{language === 'ar' ? 'الموقع المقترح:' : 'Suggested location:'} <strong>{result.suggested_location_name}</strong></span>
                        </div>
                      )}

                      {result.reasoning && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">{result.reasoning}</p>
                      )}
                      {result.current_stock_advice && (
                        <p className="text-sm font-medium">{result.current_stock_advice}</p>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button size="sm" variant="default" onClick={() => handleAction('add')}>
                          <Check className="w-4 h-4 mr-1" />{language === 'ar' ? 'أضف' : 'Add'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleAction('place_on_shelf')}>
                          <Package className="w-4 h-4 mr-1" />{language === 'ar' ? 'على الرف' : 'Shelf'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction('avoid')}>
                          <X className="w-4 h-4 mr-1" />{language === 'ar' ? 'تجاهل' : 'Avoid'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm">{language === 'ar' ? 'لم يتم التعرف على المنتج. حاول صورة أوضح.' : 'Product not recognized. Try a clearer image.'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {scanType === 'invoice' && (
              <Card>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground text-xs">{language === 'ar' ? 'المورد' : 'Vendor'}:</span> <strong>{result.vendor_name || '—'}</strong></div>
                    <div><span className="text-muted-foreground text-xs">{language === 'ar' ? 'الرقم' : 'Number'}:</span> <strong>{result.invoice_number || '—'}</strong></div>
                    <div><span className="text-muted-foreground text-xs">{language === 'ar' ? 'التاريخ' : 'Date'}:</span> <strong>{result.invoice_date || '—'}</strong></div>
                    <div><span className="text-muted-foreground text-xs">{language === 'ar' ? 'الإجمالي' : 'Total'}:</span> <strong className="tabular-nums">{result.total || 0} {result.currency || ''}</strong></div>
                  </div>
                  {!!result.line_items?.length && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'البنود' : 'Line items'}:</p>
                      {result.line_items.map((li, i) => (
                        <div key={i} className="flex justify-between text-xs py-0.5">
                          <span>{li.description}</span>
                          <span className="tabular-nums">{li.quantity} × {li.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(scanType === 'document' || scanType === 'shipment_label') && (
              <Card><CardContent className="p-4">
                <pre className="text-xs whitespace-pre-wrap font-mono">{JSON.stringify(result, null, 2)}</pre>
              </CardContent></Card>
            )}

            <Button variant="outline" onClick={retake} className="w-full">
              <RefreshCw className="w-4 h-4 mr-1.5" />{language === 'ar' ? 'مسح آخر' : 'Scan another'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
