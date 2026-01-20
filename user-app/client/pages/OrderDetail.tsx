import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
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
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  // Define order stages matching the design (3 stages) - order from right to left: تم التوصيل → تم الشحن → تم الإعداد
  const orderStages = [
    { id: 'delivered', label: 'تم التوصيل', icon: 'M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' },
    { id: 'shipped', label: 'تم الشحن', icon: 'M16 3H1V16H16V3ZM16 8H20L23 11V16H16V8ZM5.5 18.5C6.32843 18.5 7 17.8284 7 17C7 16.1716 6.32843 15.5 5.5 15.5C4.67157 15.5 4 16.1716 4 17C4 17.8284 4.67157 18.5 5.5 18.5ZM18.5 18.5C19.3284 18.5 20 17.8284 20 17C20 16.1716 19.3284 15.5 18.5 15.5C17.6716 15.5 17 16.1716 17 17C17 17.8284 17.6716 18.5 18.5 18.5Z' },
    { id: 'processing', label: 'تم الإعداد', icon: 'M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7ZM16 11H8V13H16V11Z' },
  ];

  const getStageIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    // Map backend status to our 3 stages (progress: processing → shipped → delivered)
    // Index: processing=2, shipped=1, delivered=0
    const statusMap: Record<string, number> = {
      'pending': 2,      // processing stage
      'confirmed': 2,    // processing stage
      'paid': 2,         // processing stage
      'processing': 2,   // processing stage
      'shipped': 1,      // shipped stage
      'delivered': 0,    // delivered stage
    };
    return statusMap[status] ?? -1;
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
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-24">
        <PageHeader title="الطلبات" />

      <div className="flex flex-col items-end gap-6 w-full">
        <div className="flex px-4 flex-col items-end gap-2.5 w-full">
          <p className="text-[#ADB5BD] text-right text-base font-medium leading-5 w-full">
            رقم الطلب #{order.orderNumber}
          </p>
        </div>

        {/* Order Tracker */}
        <div className="flex flex-row-reverse px-3 py-4 justify-center items-start gap-0 w-full rounded-2xl bg-white">
          {order.status === 'cancelled' ? (
            <div className="flex flex-col items-center gap-2 py-4 w-full">
              <div className="flex w-12 h-12 justify-center items-center rounded-full bg-[#DC3545]">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6L14 14M6 14L14 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[#DC3545] text-center text-sm font-medium">تم إلغاء الطلب</span>
            </div>
          ) : (
            orderStages.map((stage, index) => {
              const currentStageIndex = getStageIndex(order.status);
              // Progress goes from high index (paid=3) to low index (delivered=0)
              // A stage is completed if its index is >= currentStageIndex
              const isCompleted = currentStageIndex !== -1 && index >= currentStageIndex;
              // Line is completed if current stage is completed (line comes after the icon in RTL)
              const isLineCompleted = isCompleted;
              
              return (
                <div key={stage.id} className="flex flex-row-reverse items-start">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`flex w-14 h-14 justify-center items-center rounded-full ${
                      isCompleted 
                        ? 'bg-[#FD7E14]' 
                        : 'bg-[#E9ECEF] border-4 border-[#CED4DA]'
                    }`}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d={stage.icon} stroke={isCompleted ? "white" : "#ADB5BD"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className={`text-center text-sm font-medium leading-[140%] whitespace-pre-line ${isCompleted ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
                      {stage.label.replace(' ', '\n')}
                    </span>
                  </div>
                  
                  {index < orderStages.length - 1 && (
                    <div className="flex items-center h-14 px-1">
                      <div className={`h-1 w-6 rounded-full ${
                        isLineCompleted ? 'bg-[#FD7E14]' : 'bg-[#DEE2E6]'
                      }`}></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Order Info Fields */}
        <div className="flex h-[88px] flex-row-reverse items-center gap-4 w-full">
          <div className="flex px-3 py-2 flex-col items-end gap-2 flex-1 rounded-2xl bg-white">
            <span className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
              حالة الطلب
            </span>
            <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="flex px-3 py-2 flex-col items-end gap-2 flex-1 rounded-2xl bg-white">
            <span className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
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
        <div className="flex flex-col items-end w-full rounded-2xl bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center w-full bg-[#E9ECEF] px-4 py-3">
            <span className="w-20 text-[#6C757D] text-center text-sm font-medium">المنتج</span>
            <span className="flex-1 text-[#6C757D] text-center text-sm font-medium">الكمية</span>
            <span className="flex-1 text-[#6C757D] text-center text-sm font-medium">سعر الكرتونة</span>
            <span className="flex-1 text-[#6C757D] text-center text-sm font-medium">المجموع</span>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 w-full">لا توجد عناصر</div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center w-full px-4 py-4 ${
                  index < items.length - 1 ? "border-b border-[#E9ECEF]" : ""
                }`}
              >
                {/* Product Image */}
                <div className="w-20 flex justify-start">
                  {(item.productImage || item.imageUrl) ? (
                    <img src={item.productImage || item.imageUrl} alt={item.productNameAr || item.productName} className="h-16 w-14 rounded-lg object-contain" />
                  ) : (
                    <div className="h-16 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{item.productNameAr || item.productName}</div>
                  )}
                </div>
                
                {/* Quantity */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[#212529] text-lg font-medium">{item.quantity}</span>
                  <span className="text-[#212529] text-sm">كرتونة</span>
                </div>
                
                {/* Unit Price */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[#212529] text-lg font-medium">{parseFloat(String(item.unitPrice)).toLocaleString('ar-EG')}</span>
                  <span className="text-[#212529] text-sm">جم</span>
                </div>
                
                {/* Total */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[#212529] text-lg font-medium">{parseFloat(String(item.totalPrice)).toLocaleString('ar-EG')}</span>
                  <span className="text-[#212529] text-sm">جم</span>
                </div>
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
            <div className="flex flex-row-reverse justify-between items-center w-full pb-4 border-b border-dashed border-[#212529]">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">المجموع الفرعي</span>
              <span className="text-[#212529] text-left text-base font-bold leading-[150%]">{formatCurrency(order.subtotal)}</span>
            </div>

            <div className="flex flex-row-reverse justify-between items-center w-full pb-4 border-b border-dashed border-[#212529]">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">خصم العروض</span>
              <span className="text-[#212529] text-left text-base font-bold leading-[150%]">- {formatCurrency(order.discountAmount || '0')}</span>
            </div>

            <div className="flex flex-row-reverse justify-between items-center w-full">
              <span className="text-[#363636] text-right text-base font-medium leading-[120%]">الإجمالي</span>
              <span className="text-[#FD7E14] text-left text-2xl font-bold leading-[100%]">{formatCurrency(order.total)}</span>
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
    </PullToRefresh>
  );
}
