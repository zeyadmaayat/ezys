-- First, delete existing categories that don't match the new structure
-- Keep: green-logistics, abbreviations (rename to logistics-acronyms)
-- Delete others and create new logistics-focused categories

DELETE FROM categories WHERE slug NOT IN ('green-logistics', 'abbreviations');

-- Update abbreviations to be more professional
UPDATE categories 
SET 
  name_en = 'Logistics Acronyms & Systems',
  name_ar = 'الاختصارات والأنظمة اللوجستية',
  description_en = 'Professional reference for logistics terminology, systems, and operational acronyms including WMS, TMS, FTL, LTL, JIT, and more.',
  description_ar = 'مرجع احترافي للمصطلحات واختصارات الأنظمة اللوجستية بما في ذلك WMS وTMS وFTL وLTL وJIT والمزيد.',
  icon = 'BookText',
  sort_order = 12
WHERE slug = 'abbreviations';

-- Update green logistics
UPDATE categories 
SET 
  description_en = 'Sustainable logistics practices focusing on environmental impact reduction, carbon footprint management, and eco-friendly supply chain operations.',
  description_ar = 'الممارسات اللوجستية المستدامة التي تركز على تقليل التأثير البيئي وإدارة البصمة الكربونية وعمليات سلسلة التوريد الصديقة للبيئة.',
  icon = 'Leaf',
  sort_order = 9
WHERE slug = 'green-logistics';

-- Insert new logistics categories
INSERT INTO categories (name_en, name_ar, slug, description_en, description_ar, icon, sort_order) VALUES
-- Core Logistics Types
('Inbound Logistics', 'اللوجستيات الواردة', 'inbound-logistics', 
 'Management of incoming materials, supplier coordination, receiving operations, and raw material storage from procurement to production.',
 'إدارة المواد الواردة وتنسيق الموردين وعمليات الاستلام وتخزين المواد الخام من الشراء إلى الإنتاج.',
 'PackageCheck', 1),

('Outbound Logistics', 'اللوجستيات الصادرة', 'outbound-logistics',
 'Distribution of finished goods including order processing, packaging, shipping, and delivery to customers or retail locations.',
 'توزيع البضائع النهائية بما في ذلك معالجة الطلبات والتغليف والشحن والتسليم للعملاء أو مواقع البيع.',
 'Truck', 2),

('Internal Logistics', 'اللوجستيات الداخلية', 'internal-logistics',
 'In-house material handling, inter-facility transfers, production line supply, and internal warehouse operations.',
 'مناولة المواد الداخلية والتحويلات بين المنشآت وتوريد خط الإنتاج وعمليات المستودعات الداخلية.',
 'ArrowLeftRight', 3),

('Reverse Logistics', 'اللوجستيات العكسية', 'reverse-logistics',
 'Returns management, product recalls, recycling, refurbishment, and disposal operations for goods flowing back from customers.',
 'إدارة المرتجعات واستدعاء المنتجات وإعادة التدوير والتجديد وعمليات التخلص للبضائع العائدة من العملاء.',
 'RotateCcw', 4),

('Distribution Logistics', 'لوجستيات التوزيع', 'distribution-logistics',
 'Network design, distribution center operations, route optimization, and multi-channel fulfillment strategies.',
 'تصميم الشبكات وعمليات مراكز التوزيع وتحسين المسارات واستراتيجيات التنفيذ متعددة القنوات.',
 'Network', 5),

('International Logistics', 'اللوجستيات الدولية', 'international-logistics',
 'Cross-border shipping, customs clearance, international trade compliance, freight forwarding, and global supply chain coordination.',
 'الشحن عبر الحدود والتخليص الجمركي والامتثال للتجارة الدولية والشحن البحري وتنسيق سلسلة التوريد العالمية.',
 'Globe', 6),

('Cold Chain Logistics', 'سلسلة التبريد', 'cold-chain-logistics',
 'Temperature-controlled supply chain for pharmaceuticals, food, and perishable goods including refrigerated transport and storage.',
 'سلسلة التوريد المتحكم في درجة حرارتها للأدوية والأغذية والسلع القابلة للتلف بما في ذلك النقل والتخزين المبرد.',
 'Snowflake', 7),

('E-Commerce Logistics', 'لوجستيات التجارة الإلكترونية', 'ecommerce-logistics',
 'Online order fulfillment, last-mile delivery, returns processing, and omnichannel inventory management for digital commerce.',
 'تنفيذ الطلبات الإلكترونية والتوصيل للميل الأخير ومعالجة المرتجعات وإدارة المخزون متعددة القنوات للتجارة الرقمية.',
 'ShoppingCart', 8),

-- Service Provider Models
('Logistics Service Providers', 'مقدمو الخدمات اللوجستية', 'logistics-service-providers',
 'Comprehensive guide to 1PL through 5PL models, outsourcing strategies, and logistics service provider selection and management.',
 'دليل شامل لنماذج 1PL إلى 5PL واستراتيجيات الإسناد الخارجي واختيار وإدارة مقدمي الخدمات اللوجستية.',
 'Building2', 10),

-- End-to-End
('End-to-End Supply Chain', 'سلسلة التوريد الشاملة', 'end-to-end-supply-chain',
 'Complete supply chain visibility from raw materials to customer delivery including planning, execution, and performance optimization.',
 'رؤية كاملة لسلسلة التوريد من المواد الخام إلى تسليم العميل بما في ذلك التخطيط والتنفيذ وتحسين الأداء.',
 'GitBranch', 11);