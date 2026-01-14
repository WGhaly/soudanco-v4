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
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  // Define order stages matching admin panel
  const orderStages = [
    { id: 'pending', label: 'قيد الانتظار', icon: 'M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' },
    { id: 'confirmed', label: 'تم التأكيد', icon: 'M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' },
    { id: 'processing', label: 'قيد التجهيز', icon: 'M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z' },
    { id: 'shipped', label: 'تم الشحن', icon: 'M13 16V6C13 5.46957 12.7893 4.96086 12.4142 4.58579C12.0391 4.21071 11.5304 4 11 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V16' },
    { id: 'delivered', label: 'تم التوصيل', icon: 'M5 13L9 17L19 7' },
  ];

  const getStageIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return orderStages.findIndex(s => s.id === status);
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
          {order.status === 'cancelled' ? (
            <div className="flex flex-col items-center gap-2 py-4 w-full">
              <div className="flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_57.69%,rgba(0,0,0,0.13)_100%),#DC3545]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6L14 14M6 14L14 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[#DC3545] text-center text-sm font-medium">تم إلغاء الطلب</span>
            </div>
          ) : (
            [...orderStages].reverse().map((stage, index) => {
              const currentStageIndex = getStageIndex(order.status);
              const stageIndex = orderStages.length - 1 - index;
              const isCompleted = stageIndex <= currentStageIndex;
              const isActive = stageIndex === currentStageIndex;
              
              return (
                <div key={stage.id} className="contents">
                  <div className={`flex ${index === 0 ? 'w-[63px]' : index === orderStages.length - 1 ? 'w-[52px]' : 'w-[54px]'} flex-col items-center gap-2.5`}>
                    <div className={`flex p-2.5 justify-center items-center gap-2.5 rounded-[50px] ${
                      isCompleted 
                        ? 'bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0)_57.69%,rgba(0,0,0,0.13)_100%),#FD7E14]' 
                        : 'bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0)_0%,rgba(0,0,0,0.2)_100%),#ADB5BD]'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d={stage.icon} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className={`text-center text-sm font-normal leading-[150%] ${isActive ? 'text-[#FD7E14] font-medium' : 'text-[#212529]'}`}>
                      {stage.label}
                    </span>
                  </div>
                  
                  {index < orderStages.length - 1 && (
                    <div className="flex py-5 px-0 flex-col items-start gap-2.5 flex-1">
                      <div className={`h-1.5 w-full rounded-[30px] ${
                        stageIndex <= currentStageIndex ? 'bg-[#FD7E14]' : 'bg-[#ADB5BD]'
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
              <span className="text-[#212529] text-right text-base font-bold leading-[150%] w-full">- {formatCurrency(order.discountAmount || '0')}</span>
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
