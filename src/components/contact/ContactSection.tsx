'use client';

import { MapPin, Phone, MessageSquare, ExternalLink, Navigation, Share2 } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import SectionTitle from '@/components/ui/SectionTitle';

interface BranchItem {
  id: number;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  maps_link: string;
  phone: string;
}

interface SocialItem {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

interface ContactSectionProps {
  branches: BranchItem[];
  socialLinks: SocialItem[];
  phone?: string;
  whatsapp?: string;
}

export default function ContactSection({
  branches = [],
  socialLinks = [],
  phone,
  whatsapp,
}: ContactSectionProps) {
  const { isRtl } = useLocale();

  return (
    <section id="locations" className="py-16 md:py-24 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={isRtl ? 'فروع ومعارض الطيب' : 'Showroom Branches & Locations'}
          subtitle={
            isRtl
              ? 'تفضل بزيارة معارضنا للمعاينة الميدانية وتجربة المعدات مباشرة بحضور مهندسين مختصين'
              : 'Visit our showrooms for on-site inspection and hands-on machinery trials'
          }
          center={true}
        />

        {/* Branches Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {branches.map((b) => {
            const name = isRtl ? b.name_ar || b.name_en : b.name_en || b.name_ar;
            const address = isRtl ? b.address_ar || b.address_en : b.address_en || b.address_ar;

            return (
              <div
                key={b.id}
                className="bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#F5C400]/60 transition-all shadow-xl group"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center text-[#F5C400] flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-[#F5C400] uppercase">
                        {isRtl ? 'فرع معتمد' : 'AUTHORIZED BRANCH'}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {name}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                    {address}
                  </p>

                  {b.phone && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 font-mono">
                      <Phone className="w-4 h-4 text-[#F5C400]" />
                      <a href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                        {b.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#222] flex items-center justify-between">
                  {b.maps_link ? (
                    <a
                      href={b.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#F5C400]/10"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'الاتجاهات عبر خرائط جوجل' : 'Get Directions'}</span>
                    </a>
                  ) : (
                    <div></div>
                  )}

                  {b.phone && (
                    <a
                      href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
                    >
                      <span>{isRtl ? 'اتصال مباشر' : 'Direct Call'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Contact Bar */}
        <div className="bg-gradient-to-r from-[#151515] via-[#1A1A1A] to-[#151515] border border-[#2a2a2a] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-white">
              {isRtl ? 'هل ترغب في استشارة فورية أو حجز موعد للمعاينة؟' : 'Need immediate consultation or viewing appointment?'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {isRtl
                ? 'فريقنا متاح طوال أيام الأسبوع للرد على كافة الاستفسارات الفنية.'
                : 'Our engineering sales team is available 7 days a week for machinery inquiries.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>{isRtl ? 'محادثة واتساب مباشرة' : 'WhatsApp Us'}</span>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#333] hover:border-[#F5C400] text-sm font-bold px-6 py-3.5 rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-[#F5C400]" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
