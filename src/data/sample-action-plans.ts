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
  }
];

export function getScenariosByCategory(category: ActionPlan['category']): ActionPlan[] {
  return SAMPLE_ACTION_PLANS.filter(plan => plan.category === category);
}

export function getScenariosByDifficulty(difficulty: ActionPlan['difficulty']): ActionPlan[] {
  return SAMPLE_ACTION_PLANS.filter(plan => plan.difficulty === difficulty);
}
