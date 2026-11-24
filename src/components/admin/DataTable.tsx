'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No data found',
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222]">
              {columns.map(col => (
                <th key={col.key} className={`text-left text-[#B8B8B8] text-xs uppercase tracking-wider font-medium px-5 py-3 ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-[#B8B8B8] py-12">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={String(item[keyField] ?? idx)} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-5 py-3 text-sm ${col.className || ''}`}>
                      {col.render ? col.render(item) : (String(item[col.key] ?? ''))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages && totalPages > 1 && onPageChange && currentPage !== undefined && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#222]">
          <span className="text-[#B8B8B8] text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-[#222] text-[#B8B8B8] hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-[#222] text-[#B8B8B8] hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
