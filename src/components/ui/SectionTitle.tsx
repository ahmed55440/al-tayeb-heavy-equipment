'use client';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export default function SectionTitle({ title, subtitle, center = false }: SectionTitleProps) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {/* Industrial transparent yellow glass badge container */}
      <div className={`inline-block mb-3`}>
        <div className="relative inline-flex items-center gap-2.5 px-5 py-2 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/30 backdrop-blur-md shadow-lg shadow-[#F5C400]/5">
          <span className="w-2 h-2 rounded-full bg-[#F5C400] animate-pulse"></span>
          <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[#F5C400]">
            AL TAYEB HEAVY EQUIPMENT
          </span>
        </div>
      </div>

      <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-2.5 text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
