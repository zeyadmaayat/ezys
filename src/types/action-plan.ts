// Action Plan types for training and simulation
// These are NOT auto-executed - require user review and approval

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'skipped';

export interface ActionStep {
  id: string;
  tool: string;
  description_en: string;
  description_ar: string;
  args: Record<string, unknown>;
  status: ActionStatus;
  notes?: string;
  order: number;
}

export interface ActionPlan {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: 'procurement' | 'logistics' | 'warehouse' | 'transport' | 'customs' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime_en: string;
  estimatedTime_ar: string;
  actions: ActionStep[];
  createdAt: string;
  updatedAt: string;
}

// Available tools for logistics training scenarios
export const LOGISTICS_TOOLS = {
  'create_ticket': {
    name_en: 'Create Support Ticket',
    name_ar: 'إنشاء تذكرة دعم',
    description_en: 'Create a support or issue ticket for tracking',
    description_ar: 'إنشاء تذكرة دعم أو مشكلة للمتابعة',
    args: ['title', 'priority', 'description', 'category']
  },
  'send_email': {
    name_en: 'Send Email',
    name_ar: 'إرسال بريد إلكتروني',
    description_en: 'Send an email notification or communication',
    description_ar: 'إرسال إشعار أو تواصل عبر البريد الإلكتروني',
    args: ['to', 'subject', 'body', 'cc']
  },
  'update_inventory': {
    name_en: 'Update Inventory',
    name_ar: 'تحديث المخزون',
    description_en: 'Update stock levels or inventory records',
    description_ar: 'تحديث مستويات المخزون أو سجلات الجرد',
    args: ['sku', 'quantity', 'location', 'reason']
  },
  'create_po': {
    name_en: 'Create Purchase Order',
    name_ar: 'إنشاء أمر شراء',
    description_en: 'Generate a new purchase order for suppliers',
    description_ar: 'إنشاء أمر شراء جديد للموردين',
    args: ['supplier', 'items', 'deliveryDate', 'terms']
  },
  'schedule_shipment': {
    name_en: 'Schedule Shipment',
    name_ar: 'جدولة الشحنة',
    description_en: 'Schedule a shipment for pickup or delivery',
    description_ar: 'جدولة شحنة للاستلام أو التسليم',
    args: ['origin', 'destination', 'date', 'carrier', 'items']
  },
  'approve_document': {
    name_en: 'Approve Document',
    name_ar: 'الموافقة على مستند',
    description_en: 'Approve or sign off on a document',
    description_ar: 'الموافقة أو التوقيع على مستند',
    args: ['documentId', 'approverName', 'comments']
  },
  'log_inspection': {
    name_en: 'Log Inspection',
    name_ar: 'تسجيل الفحص',
    description_en: 'Record an inspection or quality check',
    description_ar: 'تسجيل فحص أو فحص جودة',
    args: ['itemId', 'result', 'notes', 'inspector']
  },
  'notify_stakeholder': {
    name_en: 'Notify Stakeholder',
    name_ar: 'إخطار أصحاب المصلحة',
    description_en: 'Send notification to relevant stakeholders',
    description_ar: 'إرسال إشعار لأصحاب المصلحة المعنيين',
    args: ['stakeholders', 'message', 'urgency']
  },
  'generate_report': {
    name_en: 'Generate Report',
    name_ar: 'إنشاء تقرير',
    description_en: 'Generate a logistics or operational report',
    description_ar: 'إنشاء تقرير لوجستي أو تشغيلي',
    args: ['reportType', 'dateRange', 'format']
  },
  'escalate_issue': {
    name_en: 'Escalate Issue',
    name_ar: 'تصعيد المشكلة',
    description_en: 'Escalate an issue to higher management',
    description_ar: 'تصعيد مشكلة للإدارة العليا',
    args: ['issueId', 'reason', 'priority', 'assignTo']
  }
} as const;

export type LogisticsTool = keyof typeof LOGISTICS_TOOLS;

// Helper to generate unique IDs
export const generateActionId = (): string => {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to create a new action step
export const createActionStep = (tool: LogisticsTool, order: number): ActionStep => {
  return {
    id: generateActionId(),
    tool,
    description_en: LOGISTICS_TOOLS[tool].description_en,
    description_ar: LOGISTICS_TOOLS[tool].description_ar,
    args: {},
    status: 'pending',
    order
  };
};

// Helper to create an empty action plan
export const createEmptyActionPlan = (): ActionPlan => ({
  id: generateActionId(),
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  category: 'general',
  difficulty: 'beginner',
  estimatedTime_en: '',
  estimatedTime_ar: '',
  actions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
