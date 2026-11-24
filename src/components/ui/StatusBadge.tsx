export default function StatusBadge({
  status,
  locale = 'ar',
}: {
  status: string;
  locale?: 'ar' | 'en';
}) {
  const configs: Record<string, { ar: string; en: string; style: string }> = {
    available: {
      ar: 'متوفر',
      en: 'Available',
      style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    reserved: {
      ar: 'محجوز',
      en: 'Reserved',
      style: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    sold: {
      ar: 'مباع',
      en: 'Sold',
      style: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    maintenance: {
      ar: 'تحت الصيانة',
      en: 'Maintenance',
      style: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    },
  };

  const conf = configs[status] || configs.available;
  const label = locale === 'ar' ? conf.ar : conf.en;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${conf.style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{label}</span>
    </span>
  );
}
