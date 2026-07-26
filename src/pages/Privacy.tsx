import MainLayout from '@/components/MainLayout';
import Seo from '@/components/Seo';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  return (
    <MainLayout>
      <Seo
        title={isAr ? 'سياسة الخصوصية — ezy Logistic HUB' : 'Privacy Policy — ezy Logistic HUB'}
        description={isAr ? 'كيف نجمع بياناتك ونستخدمها ونحميها في ezy Logistic HUB.' : 'How ezy Logistic HUB collects, uses, and protects your data.'}
        path="/privacy"
      />
      <section className="py-16 lg:py-24 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {isAr ? 'آخر تحديث: 26 يوليو 2026' : 'Last updated: July 26, 2026'}
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-foreground/85 leading-relaxed">
            {isAr ? (
              <>
                <p>تشرح هذه السياسة كيف يقوم <strong>ezy Logistic HUB</strong> ("نحن") بجمع واستخدام وحماية بياناتك عند استخدامك للمنصة.</p>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. البيانات التي نجمعها</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>بيانات الحساب: الاسم، البريد الإلكتروني، كلمة المرور (مشفّرة).</li>
                    <li>بيانات الشركة: اسم الشركة، الدولة، المدينة، تفاصيل الاتصال.</li>
                    <li>بيانات التشغيل: الشحنات، الطلبات، الفواتير، العملاء، المخزون.</li>
                    <li>بيانات تقنية: عنوان IP، نوع المتصفح، سجلات الوصول والأخطاء.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. كيف نستخدم بياناتك</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>تشغيل المنصة وتوفير الميزات المطلوبة.</li>
                    <li>الحفاظ على أمان الحساب ومنع الاحتيال.</li>
                    <li>إرسال إشعارات تشغيلية (مثل الموافقة على الحساب أو تنبيهات النظام).</li>
                    <li>تحسين الأداء وتحليل الاستخدام بشكل مجمّع.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. مشاركة البيانات</h2>
                  <p>لا نبيع بياناتك أبداً. نشاركها فقط مع:</p>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>مزوّدي البنية التحتية (استضافة قاعدة البيانات، البريد الإلكتروني).</li>
                    <li>مقدّمي خدمات الذكاء الاصطناعي عند استخدامك للمساعد الذكي.</li>
                    <li>الجهات الحكومية عند وجود التزام قانوني.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. عزل البيانات</h2>
                  <p>المنصة متعددة المستأجرين (Multi-tenant). بيانات كل شركة معزولة تماماً بواسطة <em>Row-Level Security</em>. لا يمكن لأي مستخدم رؤية بيانات شركة أخرى.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. حقوقك</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>الوصول إلى بياناتك وتصديرها.</li>
                    <li>تعديل أو تصحيح بياناتك.</li>
                    <li>حذف حسابك وبياناته المرتبطة.</li>
                    <li>الاعتراض على معالجة معينة أو سحب موافقتك.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">6. الاحتفاظ بالبيانات</h2>
                  <p>نحتفظ ببياناتك طالما كان حسابك نشطاً. عند الحذف تُزال البيانات خلال 30 يوماً، باستثناء ما يلزم قانونياً (مثل الفواتير الضريبية).</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">7. الأمان</h2>
                  <p>نستخدم تشفير HTTPS، تشفير كلمات المرور، وسياسات RLS على قاعدة البيانات. رغم ذلك لا توجد وسيلة آمنة بنسبة 100%.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">8. ملفات تعريف الارتباط</h2>
                  <p>نستخدم Cookies ضرورية فقط لتسجيل الدخول وتذكّر تفضيلات اللغة. لا نستخدم Cookies إعلانية.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">9. التواصل</h2>
                  <p>لأي استفسار حول الخصوصية: <a className="text-primary underline" href="mailto:zeyadmaayta@outlook.com">zeyadmaayta@outlook.com</a></p>
                </div>
              </>
            ) : (
              <>
                <p>This Privacy Policy explains how <strong>ezy Logistic HUB</strong> ("we", "our") collects, uses, and protects your data when you use the platform.</p>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. Data We Collect</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>Account data: name, email, hashed password.</li>
                    <li>Company data: company name, country, city, contact details.</li>
                    <li>Operational data: shipments, orders, invoices, clients, inventory.</li>
                    <li>Technical data: IP address, browser type, access and error logs.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. How We Use Data</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>Operating the platform and providing requested features.</li>
                    <li>Securing your account and preventing fraud.</li>
                    <li>Sending operational notifications (approvals, system alerts).</li>
                    <li>Aggregated usage analysis to improve performance.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
                  <p>We never sell your data. We share it only with:</p>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>Infrastructure providers (database hosting, email delivery).</li>
                    <li>AI providers when you use the AI assistant.</li>
                    <li>Authorities when legally required.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. Data Isolation</h2>
                  <p>The platform is multi-tenant. Each company's data is strictly isolated using Row-Level Security. No user can access another company's data.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>Access and export your data.</li>
                    <li>Correct or update your information.</li>
                    <li>Delete your account and associated data.</li>
                    <li>Object to processing or withdraw consent.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                  <p>We retain your data while your account is active. Upon deletion, data is removed within 30 days, except records we must keep for legal reasons (e.g., tax invoices).</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">7. Security</h2>
                  <p>We use HTTPS, password hashing, and database RLS policies. No system is 100% secure, but we apply industry best practices.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
                  <p>We use essential cookies only — for authentication and language preferences. No advertising cookies.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
                  <p>Privacy questions: <a className="text-primary underline" href="mailto:zeyadmaayta@outlook.com">zeyadmaayta@outlook.com</a></p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Privacy;
