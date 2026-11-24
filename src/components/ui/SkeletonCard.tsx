export default function SkeletonCard() {
  return (
    <div className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-[#222]"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#262626] rounded w-2/3"></div>
        <div className="h-3 bg-[#222] rounded w-1/2"></div>
        <div className="pt-3 border-t border-[#222] flex items-center justify-between">
          <div className="h-5 bg-[#262626] rounded w-1/3"></div>
          <div className="h-4 bg-[#222] rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}
