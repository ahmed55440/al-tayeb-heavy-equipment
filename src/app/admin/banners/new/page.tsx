import BannerForm from '@/components/admin/BannerForm';

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Create Hero Banner Slide
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Add an impactful heavy machinery slide with custom headlines.
        </p>
      </div>

      <BannerForm isEdit={false} />
    </div>
  );
}
