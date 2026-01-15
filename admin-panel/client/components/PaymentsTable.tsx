import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import type { Payment } from "@/hooks/usePayments";

interface MenuState {
  paymentId: string | null;
  position: { x: number; y: number };
}

interface PaymentsTableProps {
  payments: Payment[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function getMethodLabel(method: Payment['method']): string {
  const labels: Record<Payment['method'], string> = {
    cash: 'نقدي',
    bank_transfer: 'تحويل بنكي',
    credit: 'آجل'
  };
  return labels[method] || method;
}

function getStatusBadge(status: Payment['status']) {
  const configs = {
    pending: { label: 'معلق', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    completed: { label: 'مكتمل', classes: 'bg-green-100 text-green-800 border-green-300' },
    failed: { label: 'فشل', classes: 'bg-red-100 text-red-800 border-red-300' },
    refunded: { label: 'مسترد', classes: 'bg-gray-100 text-gray-800 border-gray-300' }
  };
  const config = configs[status];
  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${config.classes}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return `${num.toLocaleString('ar-EG')} ج.م`;
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

export default function PaymentsTable({ payments, pagination }: PaymentsTableProps) {
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState<MenuState>({ paymentId: null, position: { x: 0, y: 0 } });

  const handleMenuToggle = (paymentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    
    if (menuState.paymentId === paymentId) {
      setMenuState({ paymentId: null, position: { x: 0, y: 0 } });
    } else {
      setMenuState({
        paymentId,
        position: { x: rect.left, y: rect.bottom },
      });
    }
  };

  const closeMenu = () => {
    setMenuState({ paymentId: null, position: { x: 0, y: 0 } });
  };

  const handleView = (id: string) => {
    navigate(`/payments/${id}`);
    closeMenu();
  };

  const handleRowClick = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
          <path d="M2 10H22" stroke="#9CA3AF" strokeWidth="2"/>
          <path d="M6 15H10" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد مدفوعات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Desktop Table */}
      <div className="hidden md:block w-full rounded-lg border border-gray-300 bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-[30px] px-2.5 py-2.5 bg-gray-300 rounded-t-lg">
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">اسم العميل</div>
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">المبلغ</div>
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">الحالة</div>
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">رقم الدفعة</div>
          <div className="flex-1 text-sm text-gray-600 font-normal text-right">تاريخ العملية</div>
          <div className="w-8 px-2 py-2"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-300">
          {payments.map((payment) => (
            <div
              key={payment.id}
              onClick={() => handleRowClick(payment.id)}
              className="flex items-center gap-[30px] px-2.5 py-3.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Customer Name */}
              <div className="flex-1 text-base text-gray-900 text-right">
                {payment.customer?.businessNameAr || payment.customer?.businessName || '-'}
              </div>

              {/* Amount */}
              <div className="flex-1 text-base text-gray-900 font-bold text-right">
                {formatCurrency(payment.amount)}
              </div>

              {/* Status */}
              <div className="flex-1 text-right">
                {getStatusBadge(payment.status)}
              </div>

              {/* Payment Number */}
              <div className="flex-1 text-base text-gray-900 text-right underline">
                {payment.paymentNumber}
              </div>

              {/* Date */}
              <div className="flex-1 text-base text-gray-400 text-right">
                {formatDate(payment.createdAt)}
              </div>

              {/* Menu Icon */}
              <div className="flex items-start px-2 py-2 relative">
                <button
                  onClick={(e) => handleMenuToggle(payment.id, e)}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuState.paymentId === payment.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={closeMenu}></div>
                    <div className="absolute left-0 top-full z-50 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={() => handleView(payment.id)}
                        className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-end gap-2"
                      >
                        عرض
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {payments.map((payment) => (
          <div
            key={payment.id}
            onClick={() => handleRowClick(payment.id)}
            className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{formatDate(payment.createdAt)}</span>
              <span className="text-gray-900 font-medium">
                {payment.customer?.businessNameAr || payment.customer?.businessName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(payment.status)}
              <span className="text-gray-900 font-bold">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900 underline">{payment.paymentNumber}</span>
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
