import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useOrder, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

type OrderStage = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

function OrderTracker({ currentStage }: { currentStage: OrderStage }) {
  const stages = [
    { id: "pending", label: "قيد الانتظار", icon: "M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" },
    { id: "confirmed", label: "تم التأكيد", icon: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" },
    { id: "processing", label: "قيد التجهيز", icon: "M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" },
    { id: "shipped", label: "تم الشحن", icon: "M13 16V6C13 5.46957 12.7893 4.96086 12.4142 4.58579C12.0391 4.21071 11.5304 4 11 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V16M13 16H17M13 16H7M17 16C17 16.5304 17.2107 17.0391 17.5858 17.4142C17.9609 17.7893 18.4696 18 19 18C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16C21 15.4696 20.7893 14.9609 20.4142 14.5858C20.0391 14.2107 19.5304 14 19 14C18.4696 14 17.9609 14.2107 17.5858 14.5858C17.2107 14.9609 17 15.4696 17 16ZM7 16C7 16.5304 6.78929 17.0391 6.41421 17.4142C6.03914 17.7893 5.53043 18 5 18C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16C3 15.4696 3.21071 14.9609 3.58579 14.5858C3.96086 14.2107 4.46957 14 5 14C5.53043 14 6.03914 14.2107 6.41421 14.5858C6.78929 14.9609 7 15.4696 7 16Z" },
    { id: "delivered", label: "تم التوصيل", icon: "M5 13L9 17L19 7" }
  ];

  const stageIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex justify-center items-center gap-1.5 self-stretch rounded-2xl bg-white px-4 md:px-[122px] py-4">
      {stages.map((stage, index) => {
        const isCompleted = index <= stageIndex;
        const isActive = index === stageIndex;

        return (
          <div key={stage.id} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-2.5">
              <div className={`flex justify-center items-center p-2.5 rounded-full ${
                isCompleted 
                  ? 'bg-gradient-to-b from-transparent to-black/20 bg-brand-primary' 
                  : 'bg-gradient-to-b from-transparent to-black/20 bg-gray-500'
              }`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d={stage.icon} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <span className="text-body-text text-center text-sm font-normal leading-[150%]">{stage.label}</span>
            </div>
            {index < stages.length - 1 && (
              <div className="flex flex-col justify-center items-start gap-2.5 flex-1 self-stretch py-5">
                <div className={`h-1.5 self-stretch rounded-full ${isCompleted ? 'bg-brand-primary' : 'bg-gray-500'}`}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: orderData, isLoading, error } = useOrder(id);
  const updateOrderStatus = useUpdateOrderStatus();
  const order = orderData?.data;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('ar-EG')} جم`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return 'غير محدد';
    const methods: Record<string, string> = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      credit: 'ائتمان',
      advance: 'دفع مقدم',
    };
    return methods[method] || method;
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };
    return statusFlow[currentStatus] || null;
  };

  const getNextStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      confirmed: 'تأكيد الطلب',
      processing: 'بدء التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!id) return;
    
    updateOrderStatus.mutate(
      { id, status: newStatus as any },
      {
        onSuccess: () => {
          toast({
            title: 'تم التحديث',
            description: `تم تحديث حالة الطلب إلى ${getNextStatusLabel(newStatus)}`,
          });
        },
        onError: (error) => {
          toast({
            title: 'خطأ',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    
    updateOrderStatus.mutate(
      { id, status: 'cancelled' },
      {
        onSuccess: () => {
          toast({
            title: 'تم الإلغاء',
            description: 'تم إلغاء الطلب بنجاح',
          });
        },
        onError: (error) => {
          toast({
            title: 'خطأ',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-xl">حدث خطأ في تحميل بيانات الطلب</p>
          <Link to="/orders" className="px-4 py-2 bg-brand-primary text-white rounded-full">
            العودة إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  const orderItems = order.items || [];

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-md">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-brand-primary text-xl font-medium">سودانكو</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] mt-16 md:mt-0">
        <div className="flex flex-col gap-6 md:gap-8 w-full">
            {/* Page Header */}
            <div className="flex flex-row items-center gap-4 self-stretch">
              {/* Title - Right */}
              <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1">
                مراجعة الطلب
              </h1>

              {/* Edit Button */}
              <button className="flex justify-center items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 transition-opacity hover:opacity-90">
                <span className="text-white text-center text-base font-normal leading-[130%]">تعديل البيانات</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.6663 2.33337L11.333 2.00004Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Back Button - Left */}
              <button
                onClick={() => navigate(-1)}
                className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:opacity-90"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Order Info Section */}
            <div className="flex flex-col items-start gap-6 md:gap-8 self-stretch">
              <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                كود الطلب #{order.orderNumber}
              </h2>

              <OrderTracker currentStage={order.status as OrderStage} />

              <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                <div className="flex flex-col items-start gap-2 flex-1 rounded-2xl bg-white px-6 py-2 w-full">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">نوع الدفع</label>
                  <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">{getPaymentMethodLabel(order.paymentMethod)}</div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 rounded-2xl bg-white px-6 py-2 w-full">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">اسم العميل</label>
                  <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">{order.customer?.businessNameAr || order.customer?.businessName || 'غير محدد'}</div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 rounded-2xl bg-white px-6 py-2 w-full">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">التاريخ</label>
                  <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">{formatDate(order.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="flex flex-col items-end gap-6 self-stretch">
              <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                عناصر الطلب
              </h2>

              {/* Desktop Table */}
              <div className="hidden md:flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-theme-border rounded-lg">
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">المجموع</th>
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">سعر الكرتونة</th>
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">الكمية</th>
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">كود المنتج</th>
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">اسم المنتج</th>
                      <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">صورة المنتج</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-b border-theme-border last:border-b-0">
                        <td className="px-2.5 py-3 text-right text-body-text text-base font-bold leading-[150%]">{formatCurrency(item.totalPrice)}</td>
                        <td className="px-2.5 py-3 text-right text-body-text text-base font-bold leading-[150%]">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-2.5 py-3 text-right text-body-text text-base font-bold leading-[150%]">{item.quantity} كرتونة</td>
                        <td className="px-2.5 py-3 text-right text-body-text text-base font-normal leading-[130%]">#{item.productId.slice(0, 8)}</td>
                        <td className="px-2.5 py-3 text-right text-body-text text-base font-normal leading-[130%]">{item.productName}</td>
                        <td className="px-2.5 py-3">
                          <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="24" height="24" fill="#FD7E14" opacity="0.1"/>
                              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 15L16 10L5 21" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-4 w-full">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-4 rounded-lg border border-theme-border bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" fill="#FD7E14" opacity="0.1"/>
                          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#FD7E14" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-body-text text-base font-normal">{item.productName}</div>
                        <div className="text-gray-500 text-sm">#{item.productId.slice(0, 8)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-text text-sm">{item.quantity} كرتونة</span>
                      <span className="text-body-text text-sm">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="text-right text-body-text text-base font-bold">{formatCurrency(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Management */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="flex flex-col items-start gap-6 self-stretch">
                <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                  إدارة حالة الطلب
                </h2>

                <div className="flex flex-wrap gap-4 self-stretch justify-end">
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus(getNextStatus(order.status)!)}
                      disabled={updateOrderStatus.isPending}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {updateOrderStatus.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.6667 5L7.5 14.1667L3.33337 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span>{getNextStatusLabel(getNextStatus(order.status)!)}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleCancelOrder}
                    disabled={updateOrderStatus.isPending}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 5L5 15M5 5L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>إلغاء الطلب</span>
                  </button>
                </div>
              </div>
            )}

            {/* Discount Applied (if any) */}
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex flex-col items-start gap-6 self-stretch">
                <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                  الخصومات المطبّقة
                </h2>

                <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                  <div className="flex flex-col items-start gap-2 self-stretch rounded-lg border border-theme-success bg-green-100 p-3">
                    <div className="self-stretch text-theme-success text-right text-base font-bold leading-[150%]">
                      خصم بقيمة {formatCurrency(order.discountAmount)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary Section */}
            <div className="flex flex-col items-start gap-6 self-stretch">
              <h2 className="self-stretch text-brand-primary text-right text-2xl md:text-[32px] font-medium leading-[120%]">
                ملخص الطلب
              </h2>

              <div className="flex flex-col justify-center items-start gap-6 self-stretch">
                <div className="flex flex-col items-start gap-2 self-stretch border-b border-dashed border-body-text pb-4">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">المجموع الفرعي</label>
                  <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">{formatCurrency(order.subtotal)}</div>
                </div>

                <div className="flex flex-col items-start gap-2 self-stretch border-b border-dashed border-body-text pb-4">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">خصم العروض</label>
                  <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">- {formatCurrency(order.discountAmount)}</div>
                </div>

                {parseFloat(order.taxAmount) > 0 && (
                  <div className="flex flex-col items-start gap-2 self-stretch border-b border-dashed border-body-text pb-4">
                    <label className="text-new-black-color text-base font-medium leading-[120%]">الضريبة</label>
                    <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">{formatCurrency(order.taxAmount)}</div>
                  </div>
                )}

                <div className="flex flex-col items-start gap-3 self-stretch">
                  <label className="text-new-black-color text-base font-medium leading-[120%]">الإجمالي</label>
                  <div className="self-stretch text-brand-primary text-right text-2xl font-bold leading-[100%]">{formatCurrency(order.total)}</div>
                </div>

                {parseFloat(order.paidAmount) > 0 && (
                  <div className="flex flex-col items-start gap-2 self-stretch border-t border-dashed border-body-text pt-4">
                    <label className="text-new-black-color text-base font-medium leading-[120%]">المدفوع</label>
                    <div className="self-stretch text-green-600 text-right text-base font-bold leading-[150%]">{formatCurrency(order.paidAmount)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
