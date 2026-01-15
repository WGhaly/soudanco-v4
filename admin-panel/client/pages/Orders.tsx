import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import OrdersTable from "@/components/OrdersTable";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";

export default function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = useOrders(page, 10, {
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

  // Filter orders by search query (client-side since API doesn't support search)
  const allOrders = data?.data ?? [];
  const filteredOrders = searchQuery 
    ? allOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.businessNameAr?.includes(searchQuery)
      )
    : allOrders;
  
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
                <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">
                  الطلبات
                </h1>

                {/* Search Bar - Center */}
                <div className="flex items-center gap-1 flex-1 rounded-full bg-white px-5 py-3 border border-themeBorder max-w-[720px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="عن ماذا تبحث؟"
                    className="flex-1 bg-transparent outline-none text-right text-base text-bodyText placeholder:text-secondary"
                  />
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
              <div className="flex flex-col md:flex-row-reverse items-end gap-2.5 self-stretch justify-start">
                <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
                  <label className="text-base font-medium text-gray-900 text-right">حالة الطلب</label>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="">الكل</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
                  <label className="text-base font-medium text-gray-900 text-right">العميل</label>
                  <div className="relative">
                    <select 
                      value={customerFilter}
                      onChange={(e) => handleCustomerFilter(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="">الكل</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.businessNameAr || customer.businessName}
                        </option>
                      ))}
                    </select>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="flex flex-col items-end gap-6 self-stretch">
                <h2 className="self-stretch text-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                  جدول الطلبات
                </h2>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                    <p className="text-gray-secondary">جاري تحميل الطلبات...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
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
                  <OrdersTable 
                    orders={filteredOrders}
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
