'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, HelpCircle, Phone, User, Truck, ShieldCheck } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';

interface RequestFormProps {
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

export default function RequestForm({
  titleAr = 'محتاج معدة غير موجودة؟',
  titleEn = 'Looking for Equipment Not Available?',
  subtitleAr = 'أخبرنا بالمعدة التي تبحث عنها وسنتواصل معك فوراً عند توفرها أو نقوم باستيرادها خصيصاً لك.',
  subtitleEn = 'Tell us what equipment you need and we will contact you immediately when available or import it for you.',
}: RequestFormProps) {
  const { isRtl } = useLocale();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    equipment_name: '',
    brand: '',
    model: '',
    specs: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name.trim() || !formData.phone.trim()) {
      setError(
        isRtl
          ? 'الرجاء إدخال الاسم ورقم الهاتف للتواصل.'
          : 'Please enter your name and phone number.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success && data.ref_number) {
        setSuccessRef(data.ref_number);
        setFormData({
          customer_name: '',
          phone: '',
          equipment_name: '',
          brand: '',
          model: '',
          specs: '',
          notes: '',
        });
      } else {
        setError(data.error || (isRtl ? 'حدث خطأ أثناء إرسال الطلب' : 'Failed to submit request'));
      }
    } catch {
      setError(isRtl ? 'تعذر الاتصال بالخادم. يرجى المحاولة مجدداً.' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative Yellow Glow Backdrop */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#F5C400]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C400]/15 border border-[#F5C400]/30 text-[#F5C400] text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isRtl ? 'طلب معدة مخصصة' : 'CUSTOM EQUIPMENT SOURCING'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {isRtl ? titleAr : titleEn}
        </h2>

        <p className="mt-3 text-sm text-gray-300 leading-relaxed">
          {isRtl ? subtitleAr : subtitleEn}
        </p>
      </div>

      {/* Success Notification */}
      {successRef ? (
        <div className="max-w-xl mx-auto bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-xl font-bold text-white">
            {isRtl ? 'تم تسجيل طلبك بنجاح في النظام!' : 'Request Registered Successfully!'}
          </h3>

          <p className="text-sm text-gray-300">
            {isRtl
              ? 'تم حفظ طلبك وتعيين رقم مرجعي رسمي له. سيتواصل معك فريق المبيعات الفني لدينا في أقرب وقت.'
              : 'Your request has been logged into our database. Our sales engineering team will contact you shortly.'}
          </p>

          <div className="p-4 bg-black/50 border border-[#333] rounded-xl">
            <span className="text-xs text-gray-400 block mb-1">
              {isRtl ? 'الرقم المرجعي للطلب:' : 'Request Reference Number:'}
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#F5C400] tracking-wider">
              {successRef}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSuccessRef(null)}
            className="text-xs font-bold text-gray-400 hover:text-white underline pt-2"
          >
            {isRtl ? 'تقديم طلب معدة أخرى' : 'Submit another request'}
          </button>
        </div>
      ) : (
        /* Form Inputs */
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder={isRtl ? 'أحمد محمد' : 'John Doe'}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {isRtl ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+20 100 000 0000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {isRtl ? 'نوع المعدة' : 'Equipment Type'}
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-gray-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="equipment_name"
                  value={formData.equipment_name}
                  onChange={handleChange}
                  placeholder={isRtl ? 'لودر، حفار، ونش...' : 'Loader, Excavator...'}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {isRtl ? 'العلامة التجارية المطلوبة' : 'Desired Brand'}
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="CAT, Komatsu, Hyundai..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {isRtl ? 'الموديل أو سنة الصنع' : 'Model or Year'}
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="966H, PC300, 2020..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {isRtl ? 'المواصفات الفنية المطلوبة' : 'Desired Specifications'}
            </label>
            <textarea
              name="specs"
              rows={2}
              value={formData.specs}
              onChange={handleChange}
              placeholder={
                isRtl
                  ? 'سعة الباكت، طول البوم، قوة المحرك، نوع الجنزير، ساعات التشغيل القصوى...'
                  : 'Bucket capacity, boom length, engine power, track type, maximum hours...'
              }
              className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {isRtl ? 'ملاحظات إضافية' : 'Additional Notes (Optional)'}
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder={
                isRtl
                  ? 'أي تفاصيل خاصة بموقع العمل أو طريقة السداد أو موعد التسليم المطلوب...'
                  : 'Any special requirements, delivery date, job-site conditions...'
              }
              className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
            ></textarea>
          </div>

          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-extrabold text-sm px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#F5C400]/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isRtl ? 'إرسال طلب المعدة الآن' : 'Submit Equipment Request'}</span>
            </button>

            <p className="text-[11px] text-gray-500 mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5C400]" />
              <span>
                {isRtl
                  ? 'بياناتك محفوظة بأمان وسيتواصل معك مهندس معتمد من معرض الطيب.'
                  : 'Your information is confidential and will only be used to contact you directly.'}
              </span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
