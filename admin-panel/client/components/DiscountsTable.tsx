import { MoreVertical } from "lucide-react";
import type { Discount } from "@/hooks/useDiscounts";

interface DiscountsTableProps {
  discounts: Discount[];
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function getTypeLabel(type: Discount['type']): string {
  const labels: Record<Discount['type'], string> = {
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    buy_get: 'اشتري واحصل',
    spend_bonus: 'أنفق واحصل'
  };
  return labels[type] || type;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getDiscountDescription(discount: Discount): string {
  const name = discount.nameAr || discount.name;
  if (name) return name;
  
  switch (discount.type) {
    case 'percentage':
      return `خصم ${discount.value}%`;
    case 'fixed':
      return `خصم ${discount.value} ج.م`;
    case 'buy_get':
      return `اشتري ${discount.minQuantity || 0} واحصل على ${discount.bonusQuantity || 0} مجاناً`;
    case 'spend_bonus':
      return `أنفق ${discount.minOrderAmount || 0} واحصل على ${discount.value}%`;
    default:
      return discount.name;
  }
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

export default function DiscountsTable({ discounts, onToggleStatus, pagination }: DiscountsTableProps) {
  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 9H9.01M15 15H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 8L8 16" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد خصومات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Desktop Table */}
      <div className="hidden md:block w-full rounded-lg border border-gray-300 bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-[30px] px-2.5 py-2.5 bg-gray-300 rounded-t-lg">
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">اسم الخصم</div>
          <div className="w-32 text-sm text-gray-600 font-normal text-right">النوع</div>
          <div className="w-32 text-sm text-gray-600 font-normal text-right">صالح حتى</div>
          <div className="w-24 text-sm text-gray-600 font-normal text-center">حالة الخصم</div>
          <div className="w-8 px-2 py-2"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-300">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="flex items-center gap-[30px] px-2.5 py-3.5 bg-white hover:bg-gray-50 transition-colors"
            >
              {/* Discount Name */}
              <div className="flex-1 text-base text-gray-900 text-right">
                {getDiscountDescription(discount)}
              </div>

              {/* Type */}
              <div className="w-32 text-base text-gray-500 text-right">
                {getTypeLabel(discount.type)}
              </div>

              {/* Valid Until Date */}
              <div className="w-32 text-base text-gray-400 text-right">
                {formatDate(discount.endDate)}
              </div>

              {/* Toggle Switch */}
              <div className="w-24 flex items-center justify-center">
                <button
                  onClick={() => onToggleStatus?.(discount.id, discount.isActive)}
                  className="relative w-12 h-7 rounded-full transition-colors flex items-center"
                  style={{
                    backgroundColor: discount.isActive ? "#FD7E14" : "#D3D3D3",
                  }}
                >
                  <span
                    className="absolute w-6 h-6 rounded-full bg-white transition-all duration-300"
                    style={{
                      left: discount.isActive ? "calc(100% - 1.5rem - 2px)" : "2px",
                    }}
                  />
                </button>
              </div>

              {/* Menu Icon */}
              <div className="flex items-start px-2 py-2">
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white rounded-lg border border-gray-300 p-4 flex flex-col gap-3"
          >
            {/* Header with toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onToggleStatus?.(discount.id, discount.isActive)}
                className="relative w-12 h-7 rounded-full transition-colors flex items-center"
                style={{
                  backgroundColor: discount.isActive ? "#FD7E14" : "#D3D3D3",
                }}
              >
                <span
                  className="absolute w-6 h-6 rounded-full bg-white transition-all duration-300"
                  style={{
                    left: discount.isActive ? "calc(100% - 1.5rem - 2px)" : "2px",
                  }}
                />
              </button>
              <span className="text-sm text-gray-500">{getTypeLabel(discount.type)}</span>
            </div>

            {/* Discount Name */}
            <div className="text-base text-gray-900 text-right font-medium">
              {getDiscountDescription(discount)}
            </div>

            {/* Date */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{formatDate(discount.endDate)}</span>
              <span className="text-gray-500 text-sm">صالح حتى</span>
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
