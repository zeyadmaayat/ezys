import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShipments, ShipmentStatus, Shipment } from '@/hooks/useShipments';
import { useShipmentDocuments, DocumentType, DocumentStatus, DOCUMENT_TYPE_LABELS } from '@/hooks/useShipmentDocuments';
import { useShipmentAlerts } from '@/hooks/useShipmentAlerts';
import { useShipmentTasks } from '@/hooks/useShipmentTasks';
import { useShipmentCosts } from '@/hooks/useShipmentCosts';
import { useLanguage } from '@/contexts/LanguageContext';
import { CostsSection } from '@/components/shipments/CostsSection';
import { TasksSection } from '@/components/shipments/TasksSection';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Info,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  Planned: 'bg-muted text-muted-foreground',
  Booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  In_Transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Cleared: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  Missing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Uploaded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const ALERT_ICONS = {
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const ALERT_COLORS = {
  warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  error: 'border-red-500 bg-red-50 dark:bg-red-950',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
};

const STATUS_OPTIONS: ShipmentStatus[] = ['Planned', 'Booked', 'In_Transit', 'Cleared', 'Delivered'];
const DOC_STATUS_OPTIONS: DocumentStatus[] = ['Missing', 'Uploaded', 'Approved'];
const DOC_TYPE_OPTIONS: DocumentType[] = ['Commercial_Invoice', 'Packing_List', 'Bill_of_Lading', 'AWB', 'Other'];

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { getShipmentById, updateShipmentStatus } = useShipments();
  const { documents, loading: docsLoading, uploading, uploadDocument, updateDocumentStatus, addDocument, deleteDocument } = useShipmentDocuments(id);
  const { tasks, openTasksCount } = useShipmentTasks(id);
  const { totals: costTotals } = useShipmentCosts(id);
  
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingDocType, setAddingDocType] = useState<DocumentType | null>(null);

  const { alerts, hasAttention } = useShipmentAlerts(shipment, documents, tasks, costTotals);

  useEffect(() => {
    const loadShipment = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getShipmentById(id);
      setShipment(data);
      setLoading(false);
    };
    loadShipment();
  }, [id]);

  const handleStatusChange = async (status: ShipmentStatus) => {
    if (!id) return;
    const success = await updateShipmentStatus(id, status);
    if (success && shipment) {
      setShipment({ ...shipment, status, updated_at: new Date().toISOString() });
    }
  };

  const handleFileUpload = async (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadDocument(documentId, file);
  };

  const handleAddDocument = async () => {
    if (!addingDocType) return;
    await addDocument(addingDocType);
    setAddingDocType(null);
  };

  const t = {
    back: language === 'ar' ? 'العودة' : 'Back',
    shipmentDetails: language === 'ar' ? 'تفاصيل الشحنة' : 'Shipment Details',
    status: language === 'ar' ? 'الحالة' : 'Status',
    route: language === 'ar' ? 'المسار' : 'Route',
    product: language === 'ar' ? 'المنتج' : 'Product',
    weight: language === 'ar' ? 'الوزن' : 'Weight',
    created: language === 'ar' ? 'تاريخ الإنشاء' : 'Created',
    updated: language === 'ar' ? 'آخر تحديث' : 'Last Updated',
    documents: language === 'ar' ? 'المستندات' : 'Documents',
    alerts: language === 'ar' ? 'التنبيهات' : 'Alerts & Insights',
    upload: language === 'ar' ? 'رفع' : 'Upload',
    addDocument: language === 'ar' ? 'إضافة مستند' : 'Add Document',
    noAlerts: language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts at this time',
    attentionNeeded: language === 'ar' ? 'يحتاج انتباه' : 'Attention Needed',
    notFound: language === 'ar' ? 'الشحنة غير موجودة' : 'Shipment not found',
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!shipment) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">{t.notFound}</p>
          <Button onClick={() => navigate('/shipments')} className="mt-4">
            {t.back}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Button>
          {hasAttention && (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t.attentionNeeded}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t.shipmentDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.route}</p>
                    <div className="flex items-center gap-2 font-medium">
                      <span>{shipment.shipment_state?.origin_country || '—'}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>{shipment.shipment_state?.destination_country || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.product}</p>
                    <p className="font-medium">{shipment.shipment_state?.product_category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.weight}</p>
                    <p className="font-medium">{shipment.shipment_state?.weight_kg ? `${shipment.shipment_state.weight_kg} kg` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.status}</p>
                    <Select value={shipment.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[160px] mt-1">
                        <SelectValue>
                          <Badge className={STATUS_COLORS[shipment.status]}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>
                            <Badge className={STATUS_COLORS[status]}>
                              {status.replace('_', ' ')}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-6 text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t.created}: {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t.updated}: {format(new Date(shipment.updated_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <TasksSection shipmentId={id!} documents={documents} />

            {/* Costs */}
            <CostsSection shipmentId={id!} />

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.documents}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={addingDocType || ''} onValueChange={(v) => setAddingDocType(v as DocumentType)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.addDocument} />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPE_OPTIONS.map(type => (
                          <SelectItem key={type} value={type}>
                            {DOCUMENT_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAddDocument} disabled={!addingDocType}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No documents yet</p>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {documents.map(doc => (
                      <AccordionItem key={doc.id} value={doc.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-4 w-4" />
                            <span>{DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                            <Badge className={DOC_STATUS_COLORS[doc.status]}>
                              {doc.status}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pl-7">
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Document
                              </a>
                            )}

                            <div className="flex items-center gap-3">
                              <Input
                                type="file"
                                onChange={(e) => handleFileUpload(doc.id, e)}
                                disabled={uploading}
                                className="max-w-xs"
                              />
                              <Select
                                value={doc.status}
                                onValueChange={(v) => updateDocumentStatus(doc.id, v as DocumentStatus)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DOC_STATUS_OPTIONS.map(status => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            {doc.uploaded_at && (
                              <p className="text-sm text-muted-foreground">
                                Uploaded: {format(new Date(doc.uploaded_at), 'MMM d, yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t.alerts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">{t.noAlerts}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map(alert => {
                      const Icon = ALERT_ICONS[alert.type];
                      return (
                        <div
                          key={alert.id}
                          className={`border-l-4 p-3 rounded-r ${ALERT_COLORS[alert.type]}`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{alert.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
