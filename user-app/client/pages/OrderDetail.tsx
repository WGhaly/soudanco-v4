import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useOrder, useCancelOrder } from "@/hooks/useOrders";

export default function OrderDetail() {
  const { id } = useParams();
  
  // Fetch order data from API
  const { data: orderData, isLoading, error } = useOrder(id);
  const order = orderData?.data;
  const items = order?.items || [];

  // Cancel order mutation
  const cancelOrder = useCancelOrder();

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('ar-EG')} جنيه`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      processing: 'قيد التحضير',
      shipped: 'قيد الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  const handleCancelOrder = () => {
    if (id && confirm('هل تريد إلغاء الطلب؟')) {
      cancelOrder.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FD7E14]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-red-500">فشل في تحميل تفاصيل الطلب</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5">
      <PageHeader title="الطلبات" />

      <div className="flex flex-col items-end gap-6 w-full">
        <div className="flex px-4 flex-col items-end gap-2.5 w-full">
          <p className="text-[#ADB5BD] text-right text-base font-medium leading-5">
            رقم الطلب #{order.orderNumber}
          </p>
        </div>

        {/* Order Tracker */}
        <div className="flex px-3 py-4 justify-center items-center gap-1.5 w-full rounded-2xl bg-white">
          <div className="flex w-[63px] flex-col items-center gap-2.5">
            <div className="flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0)_0%,rgba(0,0,0,0.2)_100%),#ADB5BD]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.6667 9.16667L10 2.5L3.33333 9.16667M16.6667 9.16667V17.5H3.33333V9.16667" fill="white"/>
              </svg>
            </div>
            <span className="text-[#212529] text-center text-sm font-normal leading-[150%]">
              تم التوصيل
            </span>
          </div>

          <div className="flex py-5 px-0 flex-col items-start gap-2.5 flex-1">
            <div className="h-1.5 w-full rounded-[30px] bg-[#ADB5BD]"></div>
          </div>

          <div className="flex w-[44px] flex-col items-center gap-2.5">
            <div className="flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0)_0%,rgba(0,0,0,0.2)_100%),#ADB5BD]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 17.5H12.5M17.5 7.5V5C17.5 4.33696 17.2366 3.70107 16.7678 3.23223C16.2989 2.76339 15.663 2.5 15 2.5H5C4.33696 2.5 3.70107 2.76339 3.23223 3.23223C2.76339 3.70107 2.5 4.33696 2.5 5V7.5M17.5 7.5H2.5M17.5 7.5V15C17.5 15.663 17.2366 16.2989 16.7678 16.7678C16.2989 17.2366 15.663 17.5 15 17.5H5C4.33696 17.5 3.70107 17.2366 2.76339 16.7678C2.26339 16.2989 2.5 15.663 2.5 15V7.5" fill="white"/>
              </svg>
            </div>
            <span className="text-[#212529] text-center text-sm font-normal leading-[150%]">
              تم الدفع
            </span>
          </div>

          <div className="flex py-5 px-0 flex-col items-start gap-2.5 flex-1">
            <div className="h-1.5 w-full rounded-[30px] bg-[#ADB5BD]"></div>
          </div>

          <div className="flex w-[54px] flex-col items-center gap-2.5">
            <div className="flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_57.69%,rgba(0,0,0,0.13)_100%),#FD7E14]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 5.83333L10 10.8333L2.5 5.83333M17.5 5.83333V14.1667L10 19.1667M17.5 5.83333L10 0.833333L2.5 5.83333M2.5 5.83333V14.1667L10 19.1667" fill="white"/>
              </svg>
            </div>
            <span className="text-[#212529] text-center text-sm font-normal leading-[150%]">
              تم الشحن
            </span>
          </div>

          <div className="flex py-5 px-0 flex-col items-start gap-2.5 flex-1">
            <div className="h-1.5 w-full rounded-[30px] bg-[#FD7E14]"></div>
          </div>

          <div className="flex w-[52px] flex-col items-center gap-2.5">
            <div className="flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_57.69%,rgba(0,0,0,0.13)_100%),#FD7E14]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.6667 2.5H3.33333V17.5H16.6667V2.5Z" fill="white"/>
              </svg>
            </div>
            <span className="text-[#212529] text-center text-sm font-normal leading-[150%]">
              تم الإعداد
            </span>
          </div>
        </div>

        {/* Order Info Fields */}
        <div className="flex h-[88px] flex-row-reverse items-center gap-4 w-full">
          <div className="flex px-3 py-2 flex-col items-end gap-2 flex-1 rounded-2xl bg-white">
            <span className="text-[#363636] text-right text-base font-medium leading-[120%]">
              نوع الدفع
            </span>
            <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">
              دفع مقدم
            </span>
          </div>

          <div className="flex px-3 py-2 flex-col items-end gap-2 flex-1 rounded-2xl bg-white">
            <span className="text-[#363636] text-right text-base font-medium leading-[120%]">
              حالة الطلب
            </span>
            <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="flex px-3 py-2 flex-col items-end gap-2 flex-1 rounded-2xl bg-white">
            <span className="text-[#363636] text-right text-base font-medium leading-[120%]">
              التاريخ
            </span>
            <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <h2 className="text-[#6C757D] text-right text-2xl font-medium leading-[120%] w-full">
          عناصر الطلب
        </h2>

        {/* Products Table */}
        <div className="flex p-2.5 flex-col items-end w-full rounded-lg border border-[#DEE2E6] bg-white">
          <div className="flex px-2.5 py-2.5 flex-row-reverse items-center gap-[30px] w-full rounded-lg bg-[#DEE2E6]">
            <span className="flex-1 text-[#6C757D] text-right text-sm font-normal leading-[150%]">المجموع</span>
            <span className="flex-1 text-[#6C757D] text-right text-sm font-normal leading-[150%]">سعر الكرتونة</span>
            <span className="flex-1 text-[#6C757D] text-right text-sm font-normal leading-[150%]">الكمية</span>
            <span className="flex-1 text-[#6C757D] text-right text-sm font-normal leading-[150%]">المنتج</span>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 w-full">لا توجد عناصر</div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex px-2.5 py-[13px] flex-row-reverse items-center gap-[30px] w-full bg-white ${
                  index < items.length - 1 ? "border-b border-[#DEE2E6]" : ""
                }`}
              >
                <span className="flex-1 text-[#212529] text-right text-base font-normal leading-[130%]">{formatCurrency(item.totalPrice)}</span>
                <span className="flex-1 text-[#212529] text-right text-base font-normal leading-[130%]">{formatCurrency(item.unitPrice)}</span>
                <span className="flex-1 text-[#212529] text-right text-base font-normal leading-[130%]">{item.quantity} {item.unit}</span>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productNameAr || item.productName} className="h-[57px] flex-1 rounded-xl object-cover" />
                ) : (
                  <div className="h-[57px] flex-1 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{item.productNameAr || item.productName}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="flex p-3 flex-col items-end gap-6 w-full rounded-2xl bg-white">
          <h2 className="text-[#FD7E14] text-right text-[32px] font-medium leading-[120%] w-full">
            ملخص الطلب
          </h2>
          
          <div className="flex flex-col justify-center items-end gap-6 w-full">
            <div className="flex h-[67px] flex-col items-end gap-2 w-full border-b border-dashed border-[#212529]">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">المجموع الفرعي</span>
              <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex h-[67px] flex-col items-end gap-2 w-full border-b border-dashed border-[#212529]">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">خصم العروض</span>
              <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">- {formatCurrency(order.discount)}</span>
            </div>

            <div className="flex h-[67px] flex-col items-end gap-3 w-full border-b border-dashed border-[#212529]">
              <div className="flex flex-col items-end gap-3 w-full">
                <span className="text-[#363636] text-right text-base font-medium leading-[120%]">الإجمالي</span>
                <span className="text-[#FD7E14] text-right text-2xl font-bold leading-[100%] w-full">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="flex h-[67px] flex-col items-end gap-2 w-full">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">حالة الطلب</span>
              <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">{getStatusLabel(order.status)}</span>
            </div>
          </div>
        </div>

        {order.status === 'pending' && (
          <button 
            onClick={handleCancelOrder}
            disabled={cancelOrder.isPending}
            className="flex px-4 py-2.5 justify-center items-center gap-3 w-full rounded-full border border-[#FD7E14] disabled:opacity-50"
          >
            {cancelOrder.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#FD7E14]" />
            ) : (
              <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                إلغاء الطلب
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
