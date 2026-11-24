import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Create New Category
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Add a new heavy equipment category to your catalog.
        </p>
      </div>

      <CategoryForm isEdit={false} />
    </div>
  );
}
