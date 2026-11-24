import EquipmentForm from '@/components/admin/EquipmentForm';

export default function NewEquipmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Add New Equipment
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a new heavy machinery listing with specs, price, and high-res photos.
        </p>
      </div>

      <EquipmentForm isEdit={false} />
    </div>
  );
}
