import { Link } from "react-router-dom";
import type { Order } from "@/hooks/useOrders";

type PaymentStatus = "paid" | "partial" | "unpaid";

interface OrdersTableProps {
  orders: Order[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function getPaymentStatus(paidAmount: string, total: string): PaymentStatus {
  const paid = parseFloat(paidAmount);
  const totalAmount = parseFloat(total);
  if (paid >= totalAmount) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const configs = {
    paid: {
      label: "تم الدفع",
      classes: "border-theme-success bg-green-200 text-green-800"
    },
    partial: {
      label: "الدفع جزئيًا",
      classes: "border-brand-primary bg-orange-200 text-orange-800"
    },
    unpaid: {
      label: "غير مدفوع",
      classes: "border-red-300 bg-red-100 text-red-800"
    }
  };

  const config = configs[status];

  return (
    <div className={`flex justify-center items-center px-3 py-1 rounded-full border ${config.classes}`}>
      <span className="text-center text-sm font-normal leading-[150%]">{config.label}</span>
    </div>
  );
}

function getStatusLabel(status: Order['status']): string {
  const labels: Record<Order['status'], string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  };
  return labels[status] || status;
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

export default function OrdersTable({ orders, pagination }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#9CA3AF" strokeWidth="2"/>
          <path d="M9 12H15M9 16H13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد طلبات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Desktop Table */}
      <div className="hidden md:flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-theme-border rounded-lg">
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">رقم الطلب</th>
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">اسم العميل</th>
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">العناصر</th>
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">المجموع</th>
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">حالة الطلب</th>
              <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">التاريخ</th>
              <th className="px-2.5 py-2.5">
                <div className="w-8 h-8"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order.paidAmount, order.total);
              const itemsCount = order.items?.length || 0;
              
              return (
                <tr key={order.id} className="border-b border-theme-border last:border-b-0 hover:bg-gray-50">
                  <td className="px-2.5 py-5">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-right text-body-text text-base font-normal leading-[130%] underline hover:text-brand-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-2.5 py-5 text-right text-body-text text-base font-normal leading-[130%]">
                    {order.customer?.businessNameAr || order.customer?.businessName || '-'}
                  </td>
                  <td className="px-2.5 py-5 text-right text-body-text text-base font-normal leading-[130%]">
                    {itemsCount} عناصر
                  </td>
                  <td className="px-2.5 py-5 text-right text-body-text text-base font-bold leading-[150%]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-2.5 py-5 text-right text-body-text text-sm font-normal leading-[150%]">
                    {getStatusLabel(order.status)}
                  </td>
                  <td className="px-2.5 py-5 text-right text-gray-500 text-base font-normal leading-[130%]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-2.5 py-5">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="4" r="1.5" fill="#6C757D"/>
                        <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                        <circle cx="8" cy="12" r="1.5" fill="#6C757D"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {orders.map((order) => {
          const paymentStatus = getPaymentStatus(order.paidAmount, order.total);
          const itemsCount = order.items?.length || 0;
          
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex flex-col gap-3 p-4 rounded-lg border border-theme-border bg-white hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{formatDate(order.createdAt)}</span>
                <span className="text-body-text text-base underline">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-text text-sm">{getStatusLabel(order.status)}</span>
                <span className="text-body-text text-sm">
                  {order.customer?.businessNameAr || order.customer?.businessName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-text text-sm">{getStatusLabel(order.status)}</span>
                <span className="text-body-text text-sm">{itemsCount} عناصر</span>
              </div>
              <div className="text-right text-body-text text-base font-bold">
                {formatCurrency(order.total)}
              </div>
            </Link>
          );
        })}
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
