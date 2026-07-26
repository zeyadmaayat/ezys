import MainLayout from '@/components/MainLayout';
import Seo from '@/components/Seo';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  return (
    <MainLayout>
      <Seo
        title={isAr ? 'شروط الاستخدام — ezy Logistic HUB' : 'Terms of Service — ezy Logistic HUB'}
        description={isAr ? 'الشروط والأحكام لاستخدام منصة ezy Logistic HUB.' : 'Terms and conditions for using the ezy Logistic HUB platform.'}
        path="/terms"
      />
      <section className="py-16 lg:py-24 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {isAr ? 'شروط الاستخدام' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {isAr ? 'آخر تحديث: 26 يوليو 2026' : 'Last updated: July 26, 2026'}
          </p>

          <div className="max-w-none space-y-8 text-foreground/85 leading-relaxed">
            {isAr ? (
              <>
                <p>باستخدامك لمنصة <strong>ezy Logistic HUB</strong> فإنك توافق على الشروط التالية.</p>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. الحساب</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>يجب أن تكون بالغاً (18+) ومخوّلاً لتمثيل شركتك.</li>
                    <li>يخضع أي حساب جديد لموافقة إدارية قبل التفعيل.</li>
                    <li>أنت مسؤول عن سرية كلمة المرور وعن أي نشاط يتم عبر حسابك.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. الاستخدام المسموح</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>تُستخدم المنصة لأغراض تجارية مشروعة فقط (لوجستيات، مشتريات، مبيعات، مالية).</li>
                    <li>يُمنع رفع محتوى غير قانوني أو ضار أو ينتهك حقوق الآخرين.</li>
                    <li>يُمنع محاولة اختراق النظام أو الوصول لبيانات شركات أخرى.</li>
                    <li>يُمنع إعادة بيع أو مشاركة الوصول للمنصة دون إذن كتابي.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. الاشتراك والدفع</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>تتوفر خطة مجانية وخطط مدفوعة موضّحة في صفحة الأسعار.</li>
                    <li>الاشتراكات المدفوعة تُجدَّد تلقائياً ما لم يتم إلغاؤها قبل الموعد.</li>
                    <li>الرسوم غير قابلة للاسترداد إلا حيث يلزم القانون.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. الملكية الفكرية</h2>
                  <p>جميع حقوق البرمجيات، التصميم، الشعارات، والمحتوى محفوظة لمالك المنصة (ZEYAD). لا يمنحك استخدامك للمنصة أي حق ملكية فيها.</p>
                  <p className="mt-2">بيانات شركتك تبقى ملكاً لك، ونحن نعالجها بالنيابة عنك وفق سياسة الخصوصية.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. المساعد الذكي (AI)</h2>
                  <p>المخرجات التي يقدّمها المساعد الذكي إرشادية فقط، وقد تحتوي على أخطاء. يبقى قرار الاستخدام أو الاعتماد عليها مسؤوليتك الكاملة.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">6. توفّر الخدمة</h2>
                  <p>نسعى للحفاظ على أعلى نسبة تشغيل ممكنة، لكن قد تحدث انقطاعات مجدولة أو طارئة. لا نضمن التشغيل بنسبة 100%.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">7. حدود المسؤولية</h2>
                  <p>تُقدَّم الخدمة "كما هي". لا نتحمّل أي أضرار غير مباشرة أو خسارة أرباح أو بيانات، إلى الحد الأقصى الذي يسمح به القانون.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">8. إنهاء الحساب</h2>
                  <p>يحق لك إنهاء اشتراكك في أي وقت. يحق لنا تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط دون إشعار مسبق.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">9. التعديلات</h2>
                  <p>قد نُحدّث هذه الشروط. أي استخدام بعد التحديث يعني قبولك للنسخة الجديدة. سنُشعر المستخدمين بالتغييرات الجوهرية.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">10. القانون الواجب التطبيق</h2>
                  <p>تخضع هذه الشروط لقوانين المملكة الأردنية الهاشمية، وتختص محاكم عمّان بالنظر في أي نزاع.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">11. التواصل</h2>
                  <p>للاستفسارات القانونية: <a className="text-primary underline" href="mailto:zeyadmaayta@outlook.com">zeyadmaayta@outlook.com</a></p>
                </div>
              </>
            ) : (
              <>
                <p>By using <strong>ezy Logistic HUB</strong> you agree to the following terms.</p>

                <div>
                  <h2 className="text-xl font-semibold mb-3">1. Account</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>You must be 18+ and authorized to represent your company.</li>
                    <li>New accounts require admin approval before activation.</li>
                    <li>You are responsible for password security and activity under your account.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">2. Acceptable Use</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>The platform is for lawful business use only (logistics, procurement, sales, finance).</li>
                    <li>No illegal, harmful, or infringing content.</li>
                    <li>No attempts to breach the system or access other companies' data.</li>
                    <li>No reselling or sharing access without written permission.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">3. Subscription & Payment</h2>
                  <ul className="list-disc ms-6 space-y-1">
                    <li>Free and paid plans are described on the pricing page.</li>
                    <li>Paid subscriptions renew automatically unless cancelled before renewal.</li>
                    <li>Fees are non-refundable except where required by law.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
                  <p>All software, design, logos, and content are owned by the platform owner (ZEYAD). Using the platform grants you no ownership rights in it.</p>
                  <p className="mt-2">Your company's data remains yours; we process it on your behalf per the Privacy Policy.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">5. AI Assistant</h2>
                  <p>AI outputs are informational only and may contain errors. Any decision or reliance on them is at your own risk.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">6. Service Availability</h2>
                  <p>We strive for high uptime but may have scheduled or emergency downtime. We do not guarantee 100% availability.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                  <p>The service is provided "as is". To the maximum extent permitted by law, we are not liable for indirect damages, lost profits, or lost data.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                  <p>You may cancel at any time. We may suspend or terminate accounts that violate these terms without prior notice.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">9. Changes</h2>
                  <p>We may update these terms. Continued use after changes means acceptance. We will notify users of material changes.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
                  <p>These terms are governed by the laws of the Hashemite Kingdom of Jordan. Amman courts have jurisdiction over any dispute.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
                  <p>Legal inquiries: <a className="text-primary underline" href="mailto:zeyadmaayta@outlook.com">zeyadmaayta@outlook.com</a></p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Terms;
