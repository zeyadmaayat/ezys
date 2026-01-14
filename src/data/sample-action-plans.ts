import { ActionPlan } from '@/types/action-plan';

export const SAMPLE_ACTION_PLANS: ActionPlan[] = [
  // PROCUREMENT SCENARIOS
  {
    id: 'plan_procurement_001',
    title_en: 'Standard Purchase Order Process',
    title_ar: 'عملية أمر الشراء القياسية',
    description_en: 'Complete workflow for creating and approving a purchase order from requisition to supplier confirmation.',
    description_ar: 'سير العمل الكامل لإنشاء واعتماد أمر شراء من الطلب إلى تأكيد المورد.',
    category: 'procurement',
    difficulty: 'beginner',
    estimatedTime_en: '20 minutes',
    estimatedTime_ar: '20 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_po',
        description_en: 'Create Purchase Order for office supplies from pre-qualified supplier',
        description_ar: 'إنشاء أمر شراء للوازم المكتبية من مورد مؤهل مسبقاً',
        args: {
          supplier: 'Office Supplies Co.',
          items: 'Printer paper (500 reams), Toner cartridges (50 units)',
          deliveryDate: '2024-02-15',
          terms: 'Net 30'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'approve_document',
        description_en: 'Submit PO for management approval (value exceeds $5,000)',
        description_ar: 'تقديم أمر الشراء لاعتماد الإدارة (القيمة تتجاوز 5,000 دولار)',
        args: {
          documentId: 'PO-2024-0156',
          approverName: 'Procurement Manager',
          comments: 'Best price from qualified supplier, within budget'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Send PO confirmation to supplier with delivery instructions',
        description_ar: 'إرسال تأكيد أمر الشراء للمورد مع تعليمات التسليم',
        args: {
          to: 'orders@supplier-b.com',
          subject: 'PO-2024-0156 Confirmation',
          body: 'Please confirm receipt and expected delivery date',
          cc: 'procurement@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'create_ticket',
        description_en: 'Create follow-up ticket for delivery tracking',
        description_ar: 'إنشاء تذكرة متابعة لتتبع التسليم',
        args: {
          title: 'Track PO-2024-0156 Delivery',
          priority: 'medium',
          description: 'Follow up on delivery by Feb 15',
          category: 'procurement'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'plan_procurement_002',
    title_en: 'Emergency Procurement Procedure',
    title_ar: 'إجراء الشراء الطارئ',
    description_en: 'Fast-track procurement process for urgent operational needs with abbreviated approval workflow.',
    description_ar: 'عملية شراء سريعة للاحتياجات التشغيلية العاجلة مع سير عمل اعتماد مختصر.',
    category: 'procurement',
    difficulty: 'intermediate',
    estimatedTime_en: '15 minutes',
    estimatedTime_ar: '15 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Log emergency procurement request with justification',
        description_ar: 'تسجيل طلب شراء طارئ مع المبررات',
        args: {
          title: 'Emergency: Forklift battery replacement',
          priority: 'critical',
          description: 'Main warehouse forklift down, production at risk',
          category: 'procurement'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'notify_stakeholder',
        description_en: 'Alert Operations Director of emergency purchase need',
        description_ar: 'تنبيه مدير العمليات بالحاجة لشراء طارئ',
        args: {
          stakeholders: 'Operations Director, Finance Manager',
          message: 'Urgent approval needed for forklift battery - production impact',
          urgency: 'critical'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'create_po',
        description_en: 'Create emergency PO with express delivery',
        description_ar: 'إنشاء أمر شراء طارئ مع تسليم سريع',
        args: {
          supplier: 'Industrial Equipment Supplier',
          items: 'Industrial forklift battery 48V 600Ah x1',
          deliveryDate: 'Next business day',
          terms: 'Immediate payment'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Obtain emergency approval from Operations Director',
        description_ar: 'الحصول على اعتماد طارئ من مدير العمليات',
        args: {
          documentId: 'PO-EMG-2024-012',
          approverName: 'Operations Director',
          comments: 'Emergency approved per SOP-PROC-007'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  },
  {
    id: 'plan_procurement_003',
    title_en: 'Supplier Qualification Process',
    title_ar: 'عملية تأهيل الموردين',
    description_en: 'Evaluate and qualify a new supplier including documentation review and initial order.',
    description_ar: 'تقييم وتأهيل مورد جديد بما في ذلك مراجعة الوثائق والطلب الأولي.',
    category: 'procurement',
    difficulty: 'advanced',
    estimatedTime_en: '35 minutes',
    estimatedTime_ar: '35 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Open supplier qualification case file',
        description_ar: 'فتح ملف حالة تأهيل المورد',
        args: {
          title: 'New Supplier Qualification - Tech Components Ltd',
          priority: 'medium',
          description: 'Evaluate new supplier for electronic components category',
          category: 'procurement'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'send_email',
        description_en: 'Request qualification documents from supplier',
        description_ar: 'طلب وثائق التأهيل من المورد',
        args: {
          to: 'sales@techcomponents.com',
          subject: 'Supplier Qualification - Document Request',
          body: 'Please provide: Company registration, ISO certificates, Financial statements, References',
          cc: 'procurement@company.com'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'log_inspection',
        description_en: 'Document review of supplier qualifications',
        description_ar: 'مراجعة وثائق مؤهلات المورد',
        args: {
          itemId: 'QUAL-2024-TC-001',
          result: 'Pass',
          notes: 'All documents verified, ISO 9001 current, financial stability confirmed',
          inspector: 'Senior Procurement Officer'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Approve supplier for approved vendor list',
        description_ar: 'اعتماد المورد في قائمة الموردين المعتمدين',
        args: {
          documentId: 'AVL-2024-TC',
          approverName: 'Procurement Manager',
          comments: 'Approved for electronic components up to $50,000 per order'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'create_po',
        description_en: 'Create trial order to test supplier performance',
        description_ar: 'إنشاء طلب تجريبي لاختبار أداء المورد',
        args: {
          supplier: 'Tech Components Ltd',
          items: 'Sample order - PCB boards x100',
          deliveryDate: '2024-02-28',
          terms: 'Net 30 - Trial Order'
        },
        status: 'pending',
        order: 5
      }
    ],
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z'
  },

  // CUSTOMS SCENARIOS
  {
    id: 'plan_customs_001',
    title_en: 'Import Customs Clearance',
    title_ar: 'التخليص الجمركي للاستيراد',
    description_en: 'Complete import clearance workflow including documentation, inspection coordination, and duty payment.',
    description_ar: 'سير عمل التخليص الجمركي الكامل للاستيراد بما في ذلك التوثيق وتنسيق الفحص ودفع الرسوم.',
    category: 'customs',
    difficulty: 'intermediate',
    estimatedTime_en: '30 minutes',
    estimatedTime_ar: '30 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Open import clearance case for shipment from China',
        description_ar: 'فتح حالة تخليص استيراد لشحنة من الصين',
        args: {
          title: 'Import Clearance - SHP-2024-CN-0089',
          priority: 'high',
          description: 'Electronic components, HS 8542.31.00, Value: USD 45,000 CIF',
          category: 'customs'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'approve_document',
        description_en: 'Verify and approve customs declaration documents',
        description_ar: 'التحقق من واعتماد مستندات البيان الجمركي',
        args: {
          documentId: 'DEC-2024-0567',
          approverName: 'Customs Specialist',
          comments: 'HS code verified, value matches commercial invoice, origin documents complete'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'log_inspection',
        description_en: 'Record customs physical inspection results',
        description_ar: 'تسجيل نتائج الفحص الجمركي الفعلي',
        args: {
          itemId: 'SHP-2024-CN-0089',
          result: 'Pass',
          notes: 'Goods match declaration, no discrepancies found, sealed container intact',
          inspector: 'Customs Officer'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'send_email',
        description_en: 'Notify broker to proceed with duty payment',
        description_ar: 'إخطار المخلص للمضي قدماً في دفع الرسوم',
        args: {
          to: 'customs@broker-agency.com',
          subject: 'Proceed with Duty Payment - DEC-2024-0567',
          body: 'Inspection passed. Please proceed with duty payment. Total duties: $2,250',
          cc: 'finance@company.com'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'update_inventory',
        description_en: 'Update inventory after goods receipt and clearance',
        description_ar: 'تحديث المخزون بعد استلام البضائع والتخليص',
        args: {
          sku: 'ELEC-COMP-001',
          quantity: '5000',
          location: 'Warehouse A - Zone 3',
          reason: 'Import clearance completed - DEC-2024-0567'
        },
        status: 'pending',
        order: 5
      }
    ],
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z'
  },
  {
    id: 'plan_customs_002',
    title_en: 'Export Documentation Process',
    title_ar: 'عملية وثائق التصدير',
    description_en: 'Prepare and submit export documentation for international shipment to EU market.',
    description_ar: 'إعداد وتقديم وثائق التصدير للشحنات الدولية إلى السوق الأوروبية.',
    category: 'customs',
    difficulty: 'advanced',
    estimatedTime_en: '35 minutes',
    estimatedTime_ar: '35 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Open export documentation case for EU shipment',
        description_ar: 'فتح حالة وثائق التصدير للشحنة إلى أوروبا',
        args: {
          title: 'Export Docs - EXP-2024-0234 to Germany',
          priority: 'high',
          description: 'Industrial machinery parts, 15 pallets, 4,500 kg, FOB USD 125,000',
          category: 'customs'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'approve_document',
        description_en: 'Approve commercial invoice and packing list',
        description_ar: 'اعتماد الفاتورة التجارية وقائمة التعبئة',
        args: {
          documentId: 'INV-EXP-2024-0234',
          approverName: 'Export Documentation Officer',
          comments: 'Values verified, HS codes confirmed, Incoterms: FOB Jeddah'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'approve_document',
        description_en: 'Approve Certificate of Origin (EUR.1)',
        description_ar: 'اعتماد شهادة المنشأ (EUR.1)',
        args: {
          documentId: 'COO-EUR1-2024-0234',
          approverName: 'Chamber of Commerce',
          comments: 'Preferential origin confirmed, EUR.1 stamped'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'send_email',
        description_en: 'Send shipping documents to consignee',
        description_ar: 'إرسال مستندات الشحن إلى المرسل إليه',
        args: {
          to: 'logistics@german-import.de',
          subject: 'Shipping Documents - EXP-2024-0234',
          body: 'Attached: Commercial Invoice, Packing List, Bill of Lading, EUR.1, Certificate of Origin',
          cc: 'exports@company.com'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'generate_report',
        description_en: 'Generate export compliance report for records',
        description_ar: 'إنشاء تقرير الامتثال للتصدير للسجلات',
        args: {
          reportType: 'Export Compliance',
          dateRange: 'Q1 2024',
          format: 'PDF'
        },
        status: 'pending',
        order: 5
      }
    ],
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z'
  },
  {
    id: 'plan_customs_003',
    title_en: 'Customs Discrepancy Resolution',
    title_ar: 'حل التناقضات الجمركية',
    description_en: 'Handle a customs hold situation due to value discrepancy with proper documentation.',
    description_ar: 'التعامل مع حالة احتجاز جمركي بسبب تناقض في القيمة مع التوثيق المناسب.',
    category: 'customs',
    difficulty: 'advanced',
    estimatedTime_en: '40 minutes',
    estimatedTime_ar: '40 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Log customs hold notification and reason',
        description_ar: 'تسجيل إشعار الاحتجاز الجمركي والسبب',
        args: {
          title: 'Customs Hold - Value Discrepancy - IMP-2024-0445',
          priority: 'critical',
          description: 'Declared value questioned, customs requesting supporting documents',
          category: 'customs'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'escalate_issue',
        description_en: 'Escalate to Customs Manager for guidance',
        description_ar: 'تصعيد لمدير الجمارك للتوجيه',
        args: {
          issueId: 'HOLD-2024-0445',
          reason: 'Value discrepancy requires management decision on response strategy',
          priority: 'critical',
          assignTo: 'Customs Manager'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Request supporting documents from supplier',
        description_ar: 'طلب وثائق داعمة من المورد',
        args: {
          to: 'exports@supplier.cn',
          subject: 'URGENT: Value Verification Documents Needed',
          body: 'Customs requires: Price list, past invoices for same goods, transfer pricing agreement',
          cc: 'customs@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Submit value justification to customs authority',
        description_ar: 'تقديم تبرير القيمة للسلطة الجمركية',
        args: {
          documentId: 'VAL-JUST-2024-0445',
          approverName: 'Customs Specialist',
          comments: 'Attached: Supplier price list, comparable import history, market price evidence'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'notify_stakeholder',
        description_en: 'Update management on resolution status',
        description_ar: 'تحديث الإدارة بحالة الحل',
        args: {
          stakeholders: 'Supply Chain Director, Finance Manager',
          message: 'Customs hold resolved - value accepted, goods released for delivery',
          urgency: 'normal'
        },
        status: 'pending',
        order: 5
      }
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },

  // TRANSPORTATION SCENARIOS
  {
    id: 'plan_transport_001',
    title_en: 'Multimodal Shipment Coordination',
    title_ar: 'تنسيق الشحن متعدد الوسائط',
    description_en: 'Coordinate a shipment using sea and land transport modes from factory to final destination.',
    description_ar: 'تنسيق شحنة باستخدام وسائط النقل البحري والبري من المصنع إلى الوجهة النهائية.',
    category: 'transport',
    difficulty: 'advanced',
    estimatedTime_en: '40 minutes',
    estimatedTime_ar: '40 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'schedule_shipment',
        description_en: 'Schedule trucking from factory to port',
        description_ar: 'جدولة النقل البري من المصنع إلى الميناء',
        args: {
          origin: 'Factory - Industrial City',
          destination: 'Jeddah Islamic Port',
          date: '2024-02-10',
          carrier: 'Land Transport Co.',
          items: 'FCL 40ft container, 18,000 kg'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'schedule_shipment',
        description_en: 'Book ocean freight to Rotterdam',
        description_ar: 'حجز الشحن البحري إلى روتردام',
        args: {
          origin: 'Jeddah Islamic Port',
          destination: 'Rotterdam Port',
          date: '2024-02-15',
          carrier: 'Maersk Line',
          items: 'FCL 40ft container, petrochemical products'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'approve_document',
        description_en: 'Approve Bill of Lading details',
        description_ar: 'اعتماد تفاصيل بوليصة الشحن',
        args: {
          documentId: 'BOL-MAEU-123456789',
          approverName: 'Shipping Coordinator',
          comments: 'Shipper, consignee, and goods description verified'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'create_ticket',
        description_en: 'Set up shipment tracking and monitoring',
        description_ar: 'إعداد تتبع ومراقبة الشحنة',
        args: {
          title: 'Track Shipment - MAEU-123456789',
          priority: 'medium',
          description: 'Monitor vessel location, ETA updates, and customs status',
          category: 'logistics'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'schedule_shipment',
        description_en: 'Arrange last-mile delivery in Netherlands',
        description_ar: 'ترتيب التوصيل النهائي في هولندا',
        args: {
          origin: 'Rotterdam Port',
          destination: 'Customer Warehouse, Amsterdam',
          date: '2024-03-01',
          carrier: 'Dutch Logistics BV',
          items: 'FCL 40ft container devanning and delivery'
        },
        status: 'pending',
        order: 5
      },
      {
        id: 'step_006',
        tool: 'send_email',
        description_en: 'Confirm delivery appointment with consignee',
        description_ar: 'تأكيد موعد التسليم مع المرسل إليه',
        args: {
          to: 'warehouse@dutch-distributors.nl',
          subject: 'Delivery Confirmation - March 1, 09:00-12:00',
          body: 'Container arriving March 1. Please confirm dock availability.',
          cc: 'logistics@company.com'
        },
        status: 'pending',
        order: 6
      }
    ],
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-21T14:00:00Z'
  },
  {
    id: 'plan_transport_002',
    title_en: 'Shipment Delay Resolution',
    title_ar: 'حل تأخير الشحنة',
    description_en: 'Handle a delayed shipment situation including customer communication and alternative arrangements.',
    description_ar: 'التعامل مع حالة تأخر الشحنة بما في ذلك التواصل مع العميل والترتيبات البديلة.',
    category: 'transport',
    difficulty: 'intermediate',
    estimatedTime_en: '25 minutes',
    estimatedTime_ar: '25 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Log delay incident with current shipment status',
        description_ar: 'تسجيل حادثة التأخير مع حالة الشحنة الحالية',
        args: {
          title: 'Shipment Delay - TRK-2024-DEL-001',
          priority: 'high',
          description: 'Vessel delayed at origin port due to weather, ETA pushed by 5 days',
          category: 'logistics'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'escalate_issue',
        description_en: 'Escalate to Logistics Manager for decision',
        description_ar: 'تصعيد لمدير اللوجستيات للقرار',
        args: {
          issueId: 'TRK-2024-DEL-001',
          reason: 'Customer critical delivery - need decision on air freight option',
          priority: 'high',
          assignTo: 'Logistics Manager'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Notify customer of delay with updated ETA',
        description_ar: 'إبلاغ العميل بالتأخير مع الوقت المتوقع المحدث',
        args: {
          to: 'customer@example.com',
          subject: 'Shipment Update - Revised Delivery Date',
          body: 'We regret to inform you of a 5-day delay due to weather. New ETA: March 10, 2024.',
          cc: 'sales@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'notify_stakeholder',
        description_en: 'Update internal stakeholders on impact',
        description_ar: 'تحديث أصحاب المصلحة الداخليين بالتأثير',
        args: {
          stakeholders: 'Sales Team, Customer Service',
          message: 'Shipment TRK-2024-DEL-001 delayed 5 days. Customer notified. No partial solution available.',
          urgency: 'high'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'generate_report',
        description_en: 'Document delay for carrier performance review',
        description_ar: 'توثيق التأخير لمراجعة أداء الناقل',
        args: {
          reportType: 'Carrier Performance',
          dateRange: 'January-February 2024',
          format: 'PDF'
        },
        status: 'pending',
        order: 5
      }
    ],
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 'plan_transport_003',
    title_en: 'Cold Chain Shipment Management',
    title_ar: 'إدارة شحنات السلسلة الباردة',
    description_en: 'Manage temperature-controlled shipment for pharmaceutical products with compliance requirements.',
    description_ar: 'إدارة شحنة مبردة للمنتجات الصيدلانية مع متطلبات الامتثال.',
    category: 'transport',
    difficulty: 'advanced',
    estimatedTime_en: '45 minutes',
    estimatedTime_ar: '45 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'schedule_shipment',
        description_en: 'Book reefer transport with temperature monitoring',
        description_ar: 'حجز نقل مبرد مع مراقبة درجة الحرارة',
        args: {
          origin: 'Pharma Distribution Center, Riyadh',
          destination: 'Hospital Warehouse, Dubai',
          date: '2024-02-08',
          carrier: 'Cold Chain Logistics Co.',
          items: 'Reefer container 20ft, 2-8°C, 8,000 kg pharmaceuticals'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'approve_document',
        description_en: 'Verify temperature monitoring equipment calibration',
        description_ar: 'التحقق من معايرة معدات مراقبة درجة الحرارة',
        args: {
          documentId: 'CAL-CERT-2024-CC-078',
          approverName: 'Quality Assurance Manager',
          comments: 'Temperature logger calibrated, GDP-compliant, certificate valid until Dec 2024'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'create_ticket',
        description_en: 'Set up temperature excursion alert protocol',
        description_ar: 'إعداد بروتوكول تنبيه انحراف درجة الحرارة',
        args: {
          title: 'Cold Chain Monitoring - COLD-2024-0078',
          priority: 'critical',
          description: 'Alert if temp outside 2-8°C for >30 min. Contacts: QA Manager, Logistics Lead',
          category: 'logistics'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'log_inspection',
        description_en: 'Pre-departure temperature and packaging inspection',
        description_ar: 'فحص درجة الحرارة والتغليف قبل المغادرة',
        args: {
          itemId: 'COLD-2024-0078',
          result: 'Pass',
          notes: 'Container pre-cooled to 4°C, packaging integrity verified, data logger activated',
          inspector: 'QA Officer'
        },
        status: 'pending',
        order: 4
      },
      {
        id: 'step_005',
        tool: 'send_email',
        description_en: 'Coordinate delivery with receiving cold storage',
        description_ar: 'تنسيق التسليم مع المستودع البارد المستلم',
        args: {
          to: 'coldstorage@hospital-dubai.ae',
          subject: 'Cold Chain Delivery - Feb 10, 06:00-08:00',
          body: 'Pharmaceutical delivery arriving. Please ensure cold storage dock available and receiving team ready.',
          cc: 'qa@company.com'
        },
        status: 'pending',
        order: 5
      },
      {
        id: 'step_006',
        tool: 'generate_report',
        description_en: 'Generate temperature log report for compliance',
        description_ar: 'إنشاء تقرير سجل درجة الحرارة للامتثال',
        args: {
          reportType: 'Cold Chain Compliance',
          dateRange: 'Shipment: COLD-2024-0078',
          format: 'PDF with graphs'
        },
        status: 'pending',
        order: 6
      }
    ],
    createdAt: '2024-01-23T07:00:00Z',
    updatedAt: '2024-01-23T07:00:00Z'
  },
  // INBOUND LOGISTICS SCENARIOS
  {
    id: 'plan_inbound_001',
    title_en: 'Receiving & Put-Away Process',
    title_ar: 'عملية الاستلام والتخزين',
    description_en: 'Complete inbound workflow from truck arrival to inventory placement in warehouse.',
    description_ar: 'سير العمل الوارد الكامل من وصول الشاحنة إلى وضع المخزون في المستودع.',
    category: 'inbound',
    difficulty: 'beginner',
    estimatedTime_en: '25 minutes',
    estimatedTime_ar: '25 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Log inbound shipment arrival at dock door',
        description_ar: 'تسجيل وصول الشحنة الواردة إلى باب الرصيف',
        args: {
          title: 'Inbound Arrival - PO-2024-0890',
          priority: 'medium',
          description: 'Truck arrived at Dock 5, 15 pallets expected',
          category: 'inbound'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'log_inspection',
        description_en: 'Perform receiving inspection and count verification',
        description_ar: 'إجراء فحص الاستلام والتحقق من العدد',
        args: {
          itemId: 'PO-2024-0890',
          result: 'Pass',
          notes: '15 pallets received, no damage, count matches PO',
          inspector: 'Receiving Clerk'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'update_inventory',
        description_en: 'Update inventory with received quantities',
        description_ar: 'تحديث المخزون بالكميات المستلمة',
        args: {
          sku: 'PROD-A-001',
          quantity: '500',
          location: 'Receiving Zone',
          reason: 'Inbound receipt PO-2024-0890'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'create_ticket',
        description_en: 'Generate put-away task for warehouse team',
        description_ar: 'إنشاء مهمة التخزين لفريق المستودع',
        args: {
          title: 'Put-Away Task - PO-2024-0890',
          priority: 'medium',
          description: 'Move 15 pallets from Receiving to Bin A-12-3',
          category: 'warehouse'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-24T08:00:00Z',
    updatedAt: '2024-01-24T08:00:00Z'
  },
  {
    id: 'plan_inbound_002',
    title_en: 'Supplier ASN Processing',
    title_ar: 'معالجة إشعار الشحن المسبق',
    description_en: 'Process Advanced Shipping Notice and prepare for inbound receipt.',
    description_ar: 'معالجة إشعار الشحن المسبق والتحضير للاستلام الوارد.',
    category: 'inbound',
    difficulty: 'intermediate',
    estimatedTime_en: '20 minutes',
    estimatedTime_ar: '20 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'approve_document',
        description_en: 'Validate ASN details against purchase order',
        description_ar: 'التحقق من تفاصيل إشعار الشحن مقابل أمر الشراء',
        args: {
          documentId: 'ASN-2024-SUP-456',
          approverName: 'Inbound Coordinator',
          comments: 'ASN matches PO-2024-0891, quantities and SKUs verified'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'schedule_shipment',
        description_en: 'Confirm dock door appointment',
        description_ar: 'تأكيد موعد باب الرصيف',
        args: {
          origin: 'Supplier Warehouse',
          destination: 'Dock 3 - Main Warehouse',
          date: '2024-02-12 10:00 AM',
          carrier: 'Supplier Dedicated Fleet',
          items: '20 pallets, mixed SKUs'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Confirm appointment with supplier',
        description_ar: 'تأكيد الموعد مع المورد',
        args: {
          to: 'logistics@supplier.com',
          subject: 'Dock Appointment Confirmed - Feb 12, 10:00 AM',
          body: 'Your shipment ASN-2024-SUP-456 is scheduled for Dock 3. Please arrive 15 min early.',
          cc: 'inbound@company.com'
        },
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-24T09:00:00Z',
    updatedAt: '2024-01-24T09:00:00Z'
  },

  // OUTBOUND LOGISTICS SCENARIOS
  {
    id: 'plan_outbound_001',
    title_en: 'Order Picking & Packing',
    title_ar: 'التقاط وتغليف الطلب',
    description_en: 'Complete outbound workflow from order release to shipment dispatch.',
    description_ar: 'سير العمل الصادر الكامل من إصدار الطلب إلى إرسال الشحنة.',
    category: 'outbound',
    difficulty: 'beginner',
    estimatedTime_en: '25 minutes',
    estimatedTime_ar: '25 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Release customer order for picking',
        description_ar: 'إصدار طلب العميل للالتقاط',
        args: {
          title: 'Pick Order - SO-2024-1234',
          priority: 'high',
          description: 'Customer: ABC Corp, 5 line items, Ship by: Today 4PM',
          category: 'outbound'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'log_inspection',
        description_en: 'Verify pick accuracy and quality',
        description_ar: 'التحقق من دقة الالتقاط والجودة',
        args: {
          itemId: 'SO-2024-1234',
          result: 'Pass',
          notes: 'All items picked correctly, no damage, labels applied',
          inspector: 'Pick Team Lead'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'update_inventory',
        description_en: 'Deduct picked quantities from inventory',
        description_ar: 'خصم الكميات الملتقطة من المخزون',
        args: {
          sku: 'Multiple SKUs',
          quantity: '-50',
          location: 'Staging Area',
          reason: 'Outbound order SO-2024-1234'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'schedule_shipment',
        description_en: 'Schedule carrier pickup',
        description_ar: 'جدولة استلام الناقل',
        args: {
          origin: 'Shipping Dock 2',
          destination: 'ABC Corp, Dubai',
          date: '2024-02-10 16:00',
          carrier: 'Express Courier',
          items: '5 cartons, 45 kg total'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z'
  },
  {
    id: 'plan_outbound_002',
    title_en: 'Cross-Dock Operation',
    title_ar: 'عملية التحميل العابر',
    description_en: 'Handle cross-dock shipment with minimal storage time.',
    description_ar: 'التعامل مع شحنة التحميل العابر بأقل وقت تخزين.',
    category: 'outbound',
    difficulty: 'advanced',
    estimatedTime_en: '30 minutes',
    estimatedTime_ar: '30 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'schedule_shipment',
        description_en: 'Synchronize inbound and outbound dock times',
        description_ar: 'مزامنة أوقات الرصيف الوارد والصادر',
        args: {
          origin: 'Supplier Truck - Dock 1',
          destination: 'Customer Truck - Dock 8',
          date: '2024-02-11 09:00-11:00',
          carrier: 'Cross-dock operation',
          items: '40 pallets - direct transfer'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'notify_stakeholder',
        description_en: 'Alert cross-dock team of incoming flow',
        description_ar: 'تنبيه فريق التحميل العابر بالتدفق القادم',
        args: {
          stakeholders: 'Cross-dock Supervisor, Dock Handlers',
          message: 'Cross-dock operation scheduled 09:00. 40 pallets, 2-hour window.',
          urgency: 'high'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'log_inspection',
        description_en: 'Quick quality check during transfer',
        description_ar: 'فحص جودة سريع أثناء النقل',
        args: {
          itemId: 'XDOCK-2024-0078',
          result: 'Pass',
          notes: 'Spot check 5 pallets - all OK, labels match, no damage',
          inspector: 'Cross-dock Lead'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'send_email',
        description_en: 'Confirm dispatch to customer',
        description_ar: 'تأكيد الإرسال للعميل',
        args: {
          to: 'receiving@customer.com',
          subject: 'Shipment Dispatched - ETA Today 14:00',
          body: 'Your 40 pallet shipment has departed. Tracking: TRK-2024-XD-078',
          cc: 'logistics@company.com'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-24T11:00:00Z',
    updatedAt: '2024-01-24T11:00:00Z'
  },

  // DISTRIBUTION & FULFILLMENT SCENARIOS
  {
    id: 'plan_distribution_001',
    title_en: 'Multi-Stop Route Planning',
    title_ar: 'تخطيط مسار متعدد المحطات',
    description_en: 'Plan and execute a multi-stop delivery route for regional distribution.',
    description_ar: 'تخطيط وتنفيذ مسار توصيل متعدد المحطات للتوزيع الإقليمي.',
    category: 'distribution',
    difficulty: 'intermediate',
    estimatedTime_en: '30 minutes',
    estimatedTime_ar: '30 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Create route manifest with stop sequence',
        description_ar: 'إنشاء بيان المسار مع تسلسل المحطات',
        args: {
          title: 'Route Planning - RT-2024-0156',
          priority: 'high',
          description: '8 stops, Riyadh region, total 120 cartons, 800 kg',
          category: 'distribution'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'schedule_shipment',
        description_en: 'Optimize delivery sequence',
        description_ar: 'تحسين تسلسل التوصيل',
        args: {
          origin: 'Distribution Center',
          destination: 'Multiple (8 stops)',
          date: '2024-02-13 06:00 Start',
          carrier: 'Internal Fleet - Truck 007',
          items: 'Mixed orders, time windows applied'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Send delivery notifications to all customers',
        description_ar: 'إرسال إشعارات التوصيل لجميع العملاء',
        args: {
          to: 'customer-list@route-RT-2024-0156',
          subject: 'Delivery Scheduled - Feb 13',
          body: 'Your order is scheduled for delivery. Estimated window will be sent morning of delivery.',
          cc: 'dispatch@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'generate_report',
        description_en: 'Generate driver manifest and loading sequence',
        description_ar: 'إنشاء بيان السائق وتسلسل التحميل',
        args: {
          reportType: 'Driver Manifest',
          dateRange: 'Route RT-2024-0156',
          format: 'PDF'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-25T07:00:00Z',
    updatedAt: '2024-01-25T07:00:00Z'
  },
  {
    id: 'plan_distribution_002',
    title_en: 'DC to Store Replenishment',
    title_ar: 'التجديد من مركز التوزيع للمتجر',
    description_en: 'Execute retail store replenishment from distribution center.',
    description_ar: 'تنفيذ تجديد متجر التجزئة من مركز التوزيع.',
    category: 'distribution',
    difficulty: 'beginner',
    estimatedTime_en: '20 minutes',
    estimatedTime_ar: '20 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'generate_report',
        description_en: 'Review store stock levels and generate replenishment needs',
        description_ar: 'مراجعة مستويات مخزون المتجر وإنشاء احتياجات التجديد',
        args: {
          reportType: 'Stock Replenishment',
          dateRange: 'Current Week',
          format: 'Excel'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_ticket',
        description_en: 'Create store replenishment order',
        description_ar: 'إنشاء طلب تجديد المتجر',
        args: {
          title: 'Store Replenishment - Store #045',
          priority: 'medium',
          description: '25 SKUs, 150 cases, next delivery window',
          category: 'distribution'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'schedule_shipment',
        description_en: 'Schedule delivery to store',
        description_ar: 'جدولة التوصيل للمتجر',
        args: {
          origin: 'DC Riyadh',
          destination: 'Store #045 - Al Malaz',
          date: '2024-02-14 05:00 AM',
          carrier: 'Internal Fleet',
          items: '150 cases, 12 pallets'
        },
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-25T08:00:00Z'
  },

  // REVERSE LOGISTICS SCENARIOS
  {
    id: 'plan_reverse_001',
    title_en: 'Customer Return Processing',
    title_ar: 'معالجة مرتجعات العميل',
    description_en: 'Handle customer return from receipt to disposition decision.',
    description_ar: 'التعامل مع مرتجعات العميل من الاستلام إلى قرار التصرف.',
    category: 'reverse',
    difficulty: 'intermediate',
    estimatedTime_en: '25 minutes',
    estimatedTime_ar: '25 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Log return request with RMA number',
        description_ar: 'تسجيل طلب الإرجاع برقم RMA',
        args: {
          title: 'Return - RMA-2024-0089',
          priority: 'medium',
          description: 'Customer: XYZ Ltd, Reason: Defective unit, Original SO: 2024-0567',
          category: 'returns'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'schedule_shipment',
        description_en: 'Arrange return pickup from customer',
        description_ar: 'ترتيب استلام المرتجع من العميل',
        args: {
          origin: 'XYZ Ltd, Jeddah',
          destination: 'Returns Center',
          date: '2024-02-15',
          carrier: 'Return Logistics Co.',
          items: '1 unit, defective electronics'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'log_inspection',
        description_en: 'Inspect returned item and determine condition',
        description_ar: 'فحص العنصر المرتجع وتحديد الحالة',
        args: {
          itemId: 'RMA-2024-0089',
          result: 'Defective - Confirmed',
          notes: 'Power supply failure confirmed. Route to repair or scrap.',
          inspector: 'Returns QC'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Process refund or replacement authorization',
        description_ar: 'معالجة تفويض الاسترداد أو الاستبدال',
        args: {
          documentId: 'REFUND-2024-0089',
          approverName: 'Returns Manager',
          comments: 'Full refund approved. Customer to receive credit within 5 business days.'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  },
  {
    id: 'plan_reverse_002',
    title_en: 'Defective Product Recall',
    title_ar: 'استدعاء المنتج المعيب',
    description_en: 'Execute a product recall operation for safety-related defect.',
    description_ar: 'تنفيذ عملية استدعاء منتج بسبب عيب متعلق بالسلامة.',
    category: 'reverse',
    difficulty: 'advanced',
    estimatedTime_en: '45 minutes',
    estimatedTime_ar: '45 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'escalate_issue',
        description_en: 'Escalate recall decision to executive team',
        description_ar: 'تصعيد قرار الاستدعاء للفريق التنفيذي',
        args: {
          issueId: 'RECALL-2024-001',
          reason: 'Safety defect identified - potential fire hazard in batch B2024-45',
          priority: 'critical',
          assignTo: 'VP Operations, Legal, Quality Director'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'notify_stakeholder',
        description_en: 'Notify all affected customers and distributors',
        description_ar: 'إخطار جميع العملاء والموزعين المتأثرين',
        args: {
          stakeholders: 'Customer List - Batch B2024-45',
          message: 'URGENT: Product recall for safety. Stop use immediately. Return instructions enclosed.',
          urgency: 'critical'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'create_ticket',
        description_en: 'Set up recall return logistics',
        description_ar: 'إعداد لوجستيات إرجاع الاستدعاء',
        args: {
          title: 'Recall Returns - Batch B2024-45',
          priority: 'critical',
          description: 'Free pickup from 250 locations, target 30-day completion',
          category: 'recall'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'generate_report',
        description_en: 'Track recall progress and report to authorities',
        description_ar: 'تتبع تقدم الاستدعاء والإبلاغ للسلطات',
        args: {
          reportType: 'Recall Status Report',
          dateRange: 'Recall B2024-45 Progress',
          format: 'PDF - Regulatory Format'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  },

  // INTERNATIONAL LOGISTICS SCENARIOS
  {
    id: 'plan_international_001',
    title_en: 'Letter of Credit Documentation',
    title_ar: 'توثيق خطاب الاعتماد',
    description_en: 'Prepare and submit documents for LC payment in international trade.',
    description_ar: 'إعداد وتقديم المستندات لدفع خطاب الاعتماد في التجارة الدولية.',
    category: 'international',
    difficulty: 'advanced',
    estimatedTime_en: '40 minutes',
    estimatedTime_ar: '40 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'approve_document',
        description_en: 'Review LC terms and conditions',
        description_ar: 'مراجعة شروط وأحكام خطاب الاعتماد',
        args: {
          documentId: 'LC-2024-BANK-567',
          approverName: 'Trade Finance Manager',
          comments: 'LC terms acceptable, 60 days at sight, all documents achievable'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_ticket',
        description_en: 'Create document checklist per LC requirements',
        description_ar: 'إنشاء قائمة مستندات حسب متطلبات الاعتماد',
        args: {
          title: 'LC Documents - LC-2024-BANK-567',
          priority: 'high',
          description: 'Required: B/L, Invoice, Packing List, CO, Insurance, Inspection Cert',
          category: 'trade-finance'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'approve_document',
        description_en: 'Verify document compliance before bank submission',
        description_ar: 'التحقق من امتثال المستندات قبل تقديمها للبنك',
        args: {
          documentId: 'DOC-SET-LC-567',
          approverName: 'Documentation Specialist',
          comments: 'All documents compliant with LC terms, no discrepancies found'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'send_email',
        description_en: 'Submit documents to advising bank',
        description_ar: 'تقديم المستندات للبنك المبلغ',
        args: {
          to: 'tradedocs@bank.com',
          subject: 'LC Presentation - LC-2024-BANK-567',
          body: 'Please find attached complete document set for LC presentation. 6 documents enclosed.',
          cc: 'tradefinance@company.com'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-26T08:00:00Z',
    updatedAt: '2024-01-26T08:00:00Z'
  },
  {
    id: 'plan_international_002',
    title_en: 'Incoterms Transition (FOB to CIF)',
    title_ar: 'انتقال شروط التجارة (FOB إلى CIF)',
    description_en: 'Handle shipment when buyer requests change from FOB to CIF terms.',
    description_ar: 'التعامل مع الشحنة عندما يطلب المشتري تغيير الشروط من FOB إلى CIF.',
    category: 'international',
    difficulty: 'intermediate',
    estimatedTime_en: '30 minutes',
    estimatedTime_ar: '30 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_po',
        description_en: 'Arrange ocean freight booking',
        description_ar: 'ترتيب حجز الشحن البحري',
        args: {
          supplier: 'Shipping Line - Maersk',
          items: 'FCL 40ft, Port to Port freight',
          deliveryDate: 'Sailing: Feb 20',
          terms: 'Freight Collect → Freight Prepaid'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_po',
        description_en: 'Obtain marine cargo insurance',
        description_ar: 'الحصول على تأمين البضائع البحرية',
        args: {
          supplier: 'Marine Insurance Co.',
          items: 'All-risk marine cargo insurance, 110% CIF value',
          deliveryDate: 'Policy effective: Feb 18',
          terms: 'Coverage door-to-door'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Send revised commercial invoice with CIF pricing',
        description_ar: 'إرسال فاتورة تجارية معدلة بسعر CIF',
        args: {
          to: 'buyer@international-customer.com',
          subject: 'Revised Invoice - CIF Terms',
          body: 'As requested, please find revised invoice reflecting CIF terms. Freight: $2,500. Insurance: $450.',
          cc: 'sales@company.com'
        },
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-26T09:00:00Z',
    updatedAt: '2024-01-26T09:00:00Z'
  },

  // E-COMMERCE LOGISTICS SCENARIOS
  {
    id: 'plan_ecommerce_001',
    title_en: 'Same-Day Delivery Processing',
    title_ar: 'معالجة التوصيل في نفس اليوم',
    description_en: 'Execute same-day delivery order with cutoff management.',
    description_ar: 'تنفيذ طلب توصيل في نفس اليوم مع إدارة وقت القطع.',
    category: 'ecommerce',
    difficulty: 'intermediate',
    estimatedTime_en: '20 minutes',
    estimatedTime_ar: '20 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'create_ticket',
        description_en: 'Priority pick for same-day order',
        description_ar: 'التقاط ذو أولوية لطلب نفس اليوم',
        args: {
          title: 'URGENT: Same-Day Order - ORD-2024-8901',
          priority: 'critical',
          description: 'Cutoff: 12:00 PM, Customer in Riyadh, 2 items',
          category: 'ecommerce'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'log_inspection',
        description_en: 'Quick QC and pack verification',
        description_ar: 'فحص جودة سريع والتحقق من التغليف',
        args: {
          itemId: 'ORD-2024-8901',
          result: 'Pass',
          notes: 'Items verified, branded packaging applied, shipping label printed',
          inspector: 'E-com Fulfillment Team'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'schedule_shipment',
        description_en: 'Dispatch to same-day courier',
        description_ar: 'إرسال لمندوب نفس اليوم',
        args: {
          origin: 'E-commerce Hub',
          destination: 'Customer Address, Riyadh',
          date: 'Today before 6 PM',
          carrier: 'Same-Day Express',
          items: '1 package, 2 kg'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'send_email',
        description_en: 'Send tracking notification to customer',
        description_ar: 'إرسال إشعار التتبع للعميل',
        args: {
          to: 'customer@email.com',
          subject: 'Your order is on the way! 📦',
          body: 'Great news! Your order is out for delivery. Track: https://track.link/ABC123',
          cc: ''
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z'
  },
  {
    id: 'plan_ecommerce_002',
    title_en: 'Peak Season Capacity Planning',
    title_ar: 'تخطيط السعة لموسم الذروة',
    description_en: 'Prepare fulfillment operations for high-volume sales event.',
    description_ar: 'تحضير عمليات التنفيذ لحدث مبيعات كبير الحجم.',
    category: 'ecommerce',
    difficulty: 'advanced',
    estimatedTime_en: '35 minutes',
    estimatedTime_ar: '35 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'generate_report',
        description_en: 'Forecast order volume for sale event',
        description_ar: 'توقع حجم الطلبات لحدث التخفيضات',
        args: {
          reportType: 'Sales Forecast',
          dateRange: 'Ramadan Sale 2024',
          format: 'Excel'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_ticket',
        description_en: 'Request temporary staff for peak period',
        description_ar: 'طلب موظفين مؤقتين لفترة الذروة',
        args: {
          title: 'Peak Staff Request - Ramadan Sale',
          priority: 'high',
          description: 'Need 20 additional pickers, 10 packers for 2 weeks',
          category: 'hr'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'notify_stakeholder',
        description_en: 'Coordinate with carriers on capacity',
        description_ar: 'التنسيق مع الناقلين بشأن السعة',
        args: {
          stakeholders: 'All carrier partners',
          message: 'Expect 3x normal volume during Ramadan Sale. Please confirm capacity.',
          urgency: 'high'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'update_inventory',
        description_en: 'Pre-position fast-moving inventory',
        description_ar: 'وضع المخزون سريع الحركة مسبقاً',
        args: {
          sku: 'Top 50 SKUs',
          quantity: 'Double buffer stock',
          location: 'Prime pick locations',
          reason: 'Peak season preparation'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-26T11:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z'
  },

  // COLD CHAIN LOGISTICS SCENARIOS
  {
    id: 'plan_coldchain_001',
    title_en: 'Temperature Excursion Response',
    title_ar: 'الاستجابة لانحراف درجة الحرارة',
    description_en: 'Handle temperature deviation in cold chain shipment with proper protocol.',
    description_ar: 'التعامل مع انحراف درجة الحرارة في شحنة السلسلة الباردة بالبروتوكول المناسب.',
    category: 'cold-chain',
    difficulty: 'advanced',
    estimatedTime_en: '35 minutes',
    estimatedTime_ar: '35 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'escalate_issue',
        description_en: 'Immediate escalation of temperature breach',
        description_ar: 'تصعيد فوري لخرق درجة الحرارة',
        args: {
          issueId: 'TEMP-ALERT-2024-045',
          reason: 'Temperature exceeded 8°C for 45 minutes. Product: Vaccines. Value: $150,000',
          priority: 'critical',
          assignTo: 'QA Director, Cold Chain Manager'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'log_inspection',
        description_en: 'Document temperature excursion details',
        description_ar: 'توثيق تفاصيل انحراف درجة الحرارة',
        args: {
          itemId: 'COLD-2024-VAC-045',
          result: 'Excursion',
          notes: 'Max temp: 12°C, Duration: 45 min, Cause: Reefer unit malfunction',
          inspector: 'QA Officer'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'create_ticket',
        description_en: 'Initiate product quality assessment',
        description_ar: 'بدء تقييم جودة المنتج',
        args: {
          title: 'Quality Assessment - Excursion TEMP-ALERT-2024-045',
          priority: 'critical',
          description: 'Determine if product can be released or must be quarantined/destroyed',
          category: 'quality'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'notify_stakeholder',
        description_en: 'Notify customer and regulatory if required',
        description_ar: 'إخطار العميل والجهات التنظيمية إذا لزم الأمر',
        args: {
          stakeholders: 'Customer QA, Regulatory Affairs',
          message: 'Temperature excursion occurred. Assessment in progress. Will update within 24 hours.',
          urgency: 'critical'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-27T07:00:00Z',
    updatedAt: '2024-01-27T07:00:00Z'
  },

  // SUPPLY CHAIN SCENARIOS
  {
    id: 'plan_supplychain_001',
    title_en: 'Supplier Disruption Response',
    title_ar: 'الاستجابة لتعطل المورد',
    description_en: 'Manage supply chain disruption when key supplier faces production issues.',
    description_ar: 'إدارة تعطل سلسلة التوريد عندما يواجه المورد الرئيسي مشاكل إنتاجية.',
    category: 'supply-chain',
    difficulty: 'advanced',
    estimatedTime_en: '40 minutes',
    estimatedTime_ar: '40 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'escalate_issue',
        description_en: 'Escalate supply disruption to leadership',
        description_ar: 'تصعيد تعطل التوريد للقيادة',
        args: {
          issueId: 'DISRUPT-2024-SUP-008',
          reason: 'Primary supplier factory shutdown - 4 week delay expected. 60% of our volume affected.',
          priority: 'critical',
          assignTo: 'Supply Chain Director, COO'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'generate_report',
        description_en: 'Assess inventory coverage and shortfall',
        description_ar: 'تقييم تغطية المخزون والنقص',
        args: {
          reportType: 'Inventory Coverage Analysis',
          dateRange: 'Next 8 weeks',
          format: 'Excel with scenarios'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Contact alternate suppliers for emergency capacity',
        description_ar: 'الاتصال بالموردين البديلين للسعة الطارئة',
        args: {
          to: 'sales@alternate-supplier.com',
          subject: 'URGENT: Emergency Supply Request',
          body: 'We need 5,000 units urgently within 2 weeks. Please confirm availability and pricing.',
          cc: 'procurement@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'notify_stakeholder',
        description_en: 'Update sales team on allocation plan',
        description_ar: 'تحديث فريق المبيعات بخطة التخصيص',
        args: {
          stakeholders: 'Sales Directors, Customer Service',
          message: 'Supply constraint next 4 weeks. Priority allocation in effect. Customer communication guidelines attached.',
          urgency: 'high'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-27T08:00:00Z',
    updatedAt: '2024-01-27T08:00:00Z'
  },

  // LSP MODELS SCENARIOS
  {
    id: 'plan_lsp_001',
    title_en: '3PL Performance Review',
    title_ar: 'مراجعة أداء مزود الخدمات اللوجستية',
    description_en: 'Conduct quarterly performance review of third-party logistics provider.',
    description_ar: 'إجراء مراجعة أداء ربع سنوية لمزود الخدمات اللوجستية الخارجي.',
    category: 'lsp-models',
    difficulty: 'intermediate',
    estimatedTime_en: '30 minutes',
    estimatedTime_ar: '30 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'generate_report',
        description_en: 'Compile 3PL KPI scorecard',
        description_ar: 'تجميع بطاقة أداء KPI لمزود الخدمات',
        args: {
          reportType: '3PL Performance Scorecard',
          dateRange: 'Q4 2024',
          format: 'PDF with charts'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_ticket',
        description_en: 'Document service failures and root causes',
        description_ar: 'توثيق إخفاقات الخدمة والأسباب الجذرية',
        args: {
          title: '3PL Review - Service Issues Q4',
          priority: 'medium',
          description: 'Late deliveries: 12 incidents, Damage claims: 5, Inventory discrepancies: 3',
          category: 'vendor-management'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'send_email',
        description_en: 'Schedule quarterly business review meeting',
        description_ar: 'جدولة اجتماع المراجعة التجارية الربع سنوية',
        args: {
          to: 'account-manager@3pl-provider.com',
          subject: 'QBR Meeting - Q4 2024 Review',
          body: 'Please schedule QBR meeting for next week. Agenda: Performance review, improvement plan, 2025 planning.',
          cc: 'logistics-director@company.com'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Finalize corrective action plan',
        description_ar: 'إنهاء خطة الإجراءات التصحيحية',
        args: {
          documentId: 'CAP-3PL-Q4-2024',
          approverName: 'Logistics Director',
          comments: 'Approved with 30-day review checkpoint. SLA penalties to apply if not met.'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-27T09:00:00Z',
    updatedAt: '2024-01-27T09:00:00Z'
  },

  // DECISION FRAMEWORK SCENARIOS
  {
    id: 'plan_decision_001',
    title_en: 'Make vs Buy Analysis',
    title_ar: 'تحليل التصنيع مقابل الشراء',
    description_en: 'Evaluate whether to insource or outsource logistics operation.',
    description_ar: 'تقييم ما إذا كان يجب إدارة العمليات اللوجستية داخلياً أو الاستعانة بمصادر خارجية.',
    category: 'decision-framework',
    difficulty: 'advanced',
    estimatedTime_en: '40 minutes',
    estimatedTime_ar: '40 دقيقة',
    actions: [
      {
        id: 'step_001',
        tool: 'generate_report',
        description_en: 'Calculate total cost of ownership - internal vs 3PL',
        description_ar: 'حساب التكلفة الإجمالية للملكية - داخلي مقابل 3PL',
        args: {
          reportType: 'TCO Analysis',
          dateRange: '5-year projection',
          format: 'Excel with sensitivity analysis'
        },
        status: 'pending',
        order: 1
      },
      {
        id: 'step_002',
        tool: 'create_ticket',
        description_en: 'Document qualitative factors assessment',
        description_ar: 'توثيق تقييم العوامل النوعية',
        args: {
          title: 'Make vs Buy - Qualitative Assessment',
          priority: 'medium',
          description: 'Factors: Control, flexibility, expertise, scalability, risk',
          category: 'strategic'
        },
        status: 'pending',
        order: 2
      },
      {
        id: 'step_003',
        tool: 'notify_stakeholder',
        description_en: 'Present options to steering committee',
        description_ar: 'عرض الخيارات على اللجنة التوجيهية',
        args: {
          stakeholders: 'CFO, COO, VP Supply Chain',
          message: 'Make vs Buy analysis complete. Recommending hybrid model. Review meeting requested.',
          urgency: 'normal'
        },
        status: 'pending',
        order: 3
      },
      {
        id: 'step_004',
        tool: 'approve_document',
        description_en: 'Document final decision and rationale',
        description_ar: 'توثيق القرار النهائي والمبررات',
        args: {
          documentId: 'DECISION-MvB-2024-001',
          approverName: 'Steering Committee',
          comments: 'Approved: Outsource warehousing, keep transport in-house. Implementation by Q2 2025.'
        },
        status: 'pending',
        order: 4
      }
    ],
    createdAt: '2024-01-27T10:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z'
  }
];

export function getScenariosByCategory(category: ActionPlan['category']): ActionPlan[] {
  return SAMPLE_ACTION_PLANS.filter(plan => plan.category === category);
}

export function getScenariosByDifficulty(difficulty: ActionPlan['difficulty']): ActionPlan[] {
  return SAMPLE_ACTION_PLANS.filter(plan => plan.difficulty === difficulty);
}
