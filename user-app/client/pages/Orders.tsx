import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import { useOrders, useReorder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { label: "قيد الانتظار", bg: "bg-[#FFF3CD]", border: "border-[#FFC107]", text: "text-[#856404]" },
  processing: { label: "قيد التجهيز", bg: "bg-[#CED4DA]", border: "border-[#6C757D]", text: "text-white" },
  shipped: { label: "تم الشحن", bg: "bg-[#FECBA1]", border: "border-[#FD7E14]", text: "text-white" },
  delivered: { label: "تم التوصيل", bg: "bg-[#A3CFBB]", border: "border-[#198754]", text: "text-white" },
  cancelled: { label: "ملغي", bg: "bg-[#F8D7DA]", border: "border-[#DC3545]", text: "text-[#721C24]" },
};

export default function Orders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  
  const { data: ordersData, isLoading } = useOrders({
    status: statusFilter || undefined,
    page,
    limit: 10,
  });
  
  const reorder = useReorder();

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  const handleReorder = (orderId: string) => {
    reorder.mutate(orderId, {
      onSuccess: () => {
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة المنتجات إلى السلة",
        });
      },
      onError: (error) => {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const defaultImage = "https://api.builder.io/api/v1/image/assets/TEMP/d66240650b148c54f8c91f74cdc154658b07306a";

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-32">
        <PageHeader title="الطلبات" />
      
      <div className="flex flex-col items-end gap-6 w-full">
        {/* Filter Section */}
        <div className="flex px-4 flex-col items-end gap-2.5 w-full">
          <div className="flex flex-col items-end gap-1.5 w-full rounded-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] max-sm:ml-auto">
              حالة الطلبية
            </label>
            <div className="flex flex-row-reverse px-4 py-2.5 justify-center items-center gap-2.5 w-full rounded-full border border-white bg-white">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex-1 text-[#ADB5BD] text-right text-sm font-normal leading-[150%] cursor-pointer bg-transparent border-none outline-none appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M2 5L8 11L14 5' stroke='%23ADB5BD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left 0px center',
                }}
              >
                <option value="">كل الطلبات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد التجهيز</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FD7E14]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-[#6C757D] text-center">لا توجد طلبات</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-6 w-full">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                
                return (
                  <div
                    key={order.id}
                    className="flex p-2 flex-col items-center gap-[15px] w-full rounded-xl border border-[#F1F1F1] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.20)]"
                  >
                    {/* Order Header: Tag LEFT | Order Info RIGHT (RTL layout) */}
                    <div className="flex flex-row px-4 py-4 justify-between items-center w-full rounded-lg bg-[#DEE2E6]">
                      {/* Order Info - on RIGHT side (first in RTL) */}
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[#212529] text-base font-medium leading-[125%]">
                          رقم الطلب #{order.orderNumber}
                        </span>
                        <span className="text-[#ADB5BD] text-sm font-normal leading-[150%]">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      {/* Status Badge - on LEFT side (last in RTL) */}
                      <div className={`flex px-2.5 py-1.5 justify-center items-center rounded-full border whitespace-nowrap ${config.border} ${config.bg}`}>
                        <span className={`text-center text-sm font-normal leading-none ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex px-4 flex-col justify-center items-stretch gap-3 w-full">
                      {/* Product Row: Price LEFT | Info MIDDLE | Image RIGHT (RTL layout) */}
                      <div className="flex flex-row items-center w-full">
                        {/* Image - RIGHT side (first in RTL) */}
                        <img
                          src={defaultImage}
                          alt="Order"
                          className="w-[57px] h-[57px] rounded-xl object-cover shrink-0"
                        />
                        
                        {/* Product Info - MIDDLE (left of image in RTL) */}
                        <div className="flex flex-col items-start gap-1.5 mr-3">
                          <span className="text-[#363636] text-base font-normal leading-[130%]">
                            {order.itemCount || 0} منتجات
                          </span>
                          <span className="text-[#C0C0C0] text-sm font-normal leading-[150%]">
                            {order.addressLabel ? `${order.addressLabel} - ${order.city}` : ''}
                          </span>
                        </div>
                        
                        {/* Spacer to push price to left */}
                        <div className="flex-1" />
                        
                        {/* Price - LEFT side (last in RTL) */}
                        <span className="text-[#FD7E14] text-xl font-medium leading-[120%] shrink-0">
                          {order.total} جم
                        </span>
                      </div>

                      {/* Actions - Horizontal (always show both buttons) */}
                      <div className="flex flex-row py-2 items-center gap-2 w-full border-t border-[#DEE2E6]">
                        <button
                          onClick={() => handleReorder(order.id)}
                          disabled={reorder.isPending}
                          className="flex-1 px-3 py-2 text-sm text-center text-white bg-[#FD7E14] rounded-full hover:bg-[#E56D04] disabled:opacity-50"
                        >
                          إعادة الطلب
                        </button>
                        <Link 
                          to={`/order/${order.id}`}
                          className="flex-1 px-3 py-2 text-sm text-center text-[#FD7E14] border border-[#FD7E14] rounded-full hover:bg-[rgba(253,126,20,0.05)]"
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-row-reverse justify-center items-center gap-2 w-full mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-full bg-white border border-[#DEE2E6] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                >
                  السابق
                </button>
                <span className="text-sm text-[#6C757D]">
                  صفحة {page} من {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 rounded-full bg-white border border-[#DEE2E6] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
      </div>
    </PullToRefresh>
  );
}
