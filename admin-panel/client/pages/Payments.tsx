import { useState } from "react";
import { Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PaymentsTable from "@/components/PaymentsTable";
import { usePayments } from "@/hooks/usePayments";
import { useCustomers } from "@/hooks/useCustomers";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = usePayments(page, 10, {
    status: statusFilter || undefined,
    customerId: customerFilter || undefined,
  });
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCustomerFilter = (value: string) => {
    setCustomerFilter(value);
    setPage(1);
  };

  // Filter payments by search query (client-side)
  const allPayments = data?.data ?? [];
  const filteredPayments = searchQuery 
    ? allPayments.filter(payment => 
        payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer?.businessNameAr?.includes(searchQuery)
      )
    : allPayments;
  
  const pagination = data?.pagination;
  const customers = customersData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-[60px]">
        <div className="w-full flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-4">
            {/* Title */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 md:flex-initial text-right">المدفوعات</h1>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-[720px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="عن ماذا تبحث؟"
                className="w-full px-5 py-3 pr-12 rounded-full bg-white border border-gray-200 text-base text-right outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Refresh Button */}
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex w-10 h-10 justify-center items-center rounded-full bg-gray-200 hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row-reverse items-end gap-4">
            {/* Status Filter */}
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
              <label className="text-base font-medium text-gray-900 text-right">حالة الدفع</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="">الكل</option>
                  <option value="pending">معلق</option>
                  <option value="completed">مكتمل</option>
                  <option value="failed">فشل</option>
                  <option value="refunded">مسترد</option>
                </select>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Customer Filter */}
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
              <label className="text-base font-medium text-gray-900 text-right">العميل</label>
              <div className="relative">
                <select
                  value={customerFilter}
                  onChange={(e) => handleCustomerFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="">الكل</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.businessNameAr || customer.businessName}
                    </option>
                  ))}
                </select>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-medium text-secondary text-right">جدول المدفوعات</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-gray-secondary">جاري تحميل المدفوعات...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-500 text-lg">حدث خطأ أثناء تحميل البيانات</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <PaymentsTable 
                payments={filteredPayments}
                pagination={pagination ? {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                  onPageChange: setPage,
                } : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
