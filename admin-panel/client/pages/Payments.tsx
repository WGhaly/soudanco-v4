import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, AlertCircle, RefreshCw, ArrowRight, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PaymentsTable from "@/components/PaymentsTable";
import { usePayments, usePaymentStats } from "@/hooks/usePayments";
import { useCustomers } from "@/hooks/useCustomers";

// Helper function to format currency
function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function Payments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = usePayments(page, 10, {
    status: statusFilter || undefined,
    customerId: customerFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { data: customersData } = useCustomers({ page: 1, limit: 100 });
  const { data: statsData, isLoading: statsLoading } = usePaymentStats(fromDate || undefined, toDate || undefined);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCustomerFilter = (value: string) => {
    setCustomerFilter(value);
    setPage(1);
  };

  const handleDateFilter = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
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
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px]">
        <div className="flex flex-col gap-6 md:gap-8 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-4 self-stretch">
            {/* Title - Right */}
            <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">المدفوعات</h1>

            {/* Search Bar - Center */}
            <div className="flex max-w-[720px] px-5 py-3 items-center gap-1 flex-1 rounded-[28px] bg-white border border-themeBorder">
              <div className="flex h-[30px] items-center gap-4 flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="عن ماذا تبحث؟"
                  className="flex-1 text-secondary text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                />
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Refresh Button */}
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex w-10 h-10 justify-center items-center rounded-full bg-gray-200 hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
            </button>

            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row-reverse items-end gap-4 flex-wrap">
            {/* Status Filter */}
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto min-w-[150px]">
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
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto min-w-[150px]">
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

            {/* From Date Filter */}
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto min-w-[150px]">
              <label className="text-base font-medium text-gray-900 text-right">من تاريخ</label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleDateFilter(e.target.value, toDate)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* To Date Filter */}
            <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto min-w-[150px]">
              <label className="text-base font-medium text-gray-900 text-right">إلى تاريخ</label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleDateFilter(fromDate, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(fromDate || toDate) && (
              <button
                onClick={() => handleDateFilter('', '')}
                className="px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50"
              >
                مسح التاريخ
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Payments */}
            <div className="flex flex-col gap-2 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <span className="text-sm text-green-600 font-medium">إجمالي المدفوعات</span>
              <span className="text-3xl font-bold text-green-700">
                {statsLoading ? '...' : formatCurrency(statsData?.data?.totalPayments || 0)}
              </span>
              {(fromDate || toDate) && (
                <span className="text-xs text-green-500">
                  {fromDate && `من ${fromDate}`} {toDate && `إلى ${toDate}`}
                </span>
              )}
            </div>

            {/* Uncovered Credit */}
            <div className="flex flex-col gap-2 p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <span className="text-sm text-red-600 font-medium">إجمالي الرصيد المستهلك غير المغطى</span>
              <span className="text-3xl font-bold text-red-700">
                {statsLoading ? '...' : formatCurrency(statsData?.data?.uncoveredCredit || 0)}
              </span>
              <span className="text-xs text-red-500">رصيد العملاء المتبقي للسداد</span>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex flex-col items-end gap-6 self-stretch">
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
      </main>
    </div>
  );
}
