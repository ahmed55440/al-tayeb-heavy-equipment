import { getPublicLayoutData } from '@/lib/public-data';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getPublicLayoutData();

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-white">
      <Header
        siteNameAr={data.siteNameAr}
        siteNameEn={data.siteNameEn}
        logoUrl={data.logoUrl}
        phone={data.phone}
        whatsapp={data.whatsapp}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteNameAr={data.siteNameAr}
        siteNameEn={data.siteNameEn}
        logoUrl={data.logoUrl}
        footerTextAr={data.footerTextAr}
        footerTextEn={data.footerTextEn}
        phone={data.phone}
        whatsapp={data.whatsapp}
        socialLinks={data.socialLinks}
      />
    </div>
  );
}
