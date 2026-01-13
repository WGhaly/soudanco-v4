import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import type { PriceList } from "@/hooks/usePriceLists";

interface PriceListsTableProps {
  priceLists: PriceList[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Generate page numbers for pagination
function getPageNumbers(page: number, totalPages: number): (number | 'dots')[] {
  const pages: (number | 'dots')[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('dots');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('dots');
    pages.push(totalPages);
  }
  return pages;
}

export default function PriceListsTable({ priceLists, pagination }: PriceListsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/price-lists/${id}`);
  };

  if (priceLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#9CA3AF" strokeWidth="2"/>
          <path d="M9 12H15M9 16H13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد قوائم أسعار</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop Table */}
      <div className="hidden md:flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-8 px-4 py-3 bg-gray-200 rounded-t-lg">
          <div className="flex-1 text-sm text-secondary text-right">اسم القائمة</div>
          <div className="flex-1 text-sm text-secondary text-right">الوصف</div>
          <div className="w-32 text-sm text-secondary text-center">عدد المنتجات</div>
          <div className="w-32 text-sm text-secondary text-center">عدد العملاء</div>
          <div className="w-24 text-sm text-secondary text-center">الحالة</div>
          <div className="flex-1 text-sm text-secondary text-right">آخر تحديث</div>
          <div className="w-8"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {priceLists.map((priceList) => (
            <div
              key={priceList.id}
              onClick={() => handleRowClick(priceList.id)}
              className="flex items-center gap-8 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* List Name */}
              <div className="flex-1 text-base text-gray-900 text-right">
                {priceList.nameAr || priceList.name}
              </div>

              {/* Description */}
              <div className="flex-1 text-sm text-gray-600 text-right truncate">
                {priceList.description || '-'}
              </div>

              {/* Item Count */}
              <div className="w-32 text-base font-bold text-gray-900 text-center">
                {priceList.itemCount || priceList.items?.length || 0}
              </div>

              {/* Customer Count */}
              <div className="w-32 text-base font-bold text-blue-600 text-center">
                {priceList.customerCount || 0}
              </div>

              {/* Status */}
              <div className="w-24 flex justify-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  priceList.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {priceList.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              {/* Last Update */}
              <div className="flex-1 text-base text-gray-400 text-right">
                {formatDate(priceList.updatedAt)}
              </div>

              {/* Menu Icon */}
              <div className="w-8 flex justify-center">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-secondary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {priceLists.map((priceList) => (
          <div
            key={priceList.id}
            onClick={() => handleRowClick(priceList.id)}
            className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded-full ${
                priceList.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {priceList.isActive ? 'نشط' : 'غير نشط'}
              </span>
              <span className="text-base font-medium text-gray-900">
                {priceList.nameAr || priceList.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">
                {priceList.itemCount || priceList.items?.length || 0}
              </span>
              <span className="text-gray-500 text-sm">عدد المنتجات:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-blue-600">
                {priceList.customerCount || 0}
              </span>
              <span className="text-gray-500 text-sm">عدد العملاء:</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{formatDate(priceList.updatedAt)}</span>
              <span className="text-gray-500 text-sm">آخر تحديث:</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 self-stretch">
          <button 
            className="flex w-11 h-11 justify-center items-center p-1.5 hover:opacity-70 disabled:opacity-30"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 15L6 10L11 5" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {getPageNumbers(pagination.page, pagination.totalPages).map((pageNum, idx) => 
            pageNum === 'dots' ? (
              <span key={`dots-${idx}`} className="flex w-11 h-11 justify-center items-center text-body-text">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => pagination.onPageChange(pageNum)}
                className={`flex w-11 h-11 justify-center items-center text-base font-bold ${
                  pagination.page === pageNum ? 'text-brand-primary' : 'text-body-text hover:opacity-70'
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button 
            className="flex w-11 h-11 justify-center items-center p-1.5 hover:opacity-70 disabled:opacity-30"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L14 10L9 15" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
