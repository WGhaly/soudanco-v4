import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { usePayment } from "@/hooks/usePayments";

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: paymentData, isLoading, error } = usePayment(id);
  const payment = paymentData?.data;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('ar-EG')} جم`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      credit: 'ائتمان',
    };
    return methods[method] || method;
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; classes: string }> = {
      completed: { label: 'تم الدفع', classes: 'border-green-500 bg-green-200 text-green-800' },
      pending: { label: 'قيد الانتظار', classes: 'border-yellow-500 bg-yellow-200 text-yellow-800' },
      failed: { label: 'فشل', classes: 'border-red-500 bg-red-200 text-red-800' },
      refunded: { label: 'تم الاسترداد', classes: 'border-gray-500 bg-gray-200 text-gray-800' },
    };
    const config = configs[status] || configs.pending;
    return (
      <div className={`flex items-center justify-center px-3 py-1 rounded-full border ${config.classes}`}>
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex min-h-screen bg-gray-50" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-xl">حدث خطأ في تحميل بيانات الدفع</p>
          <Link to="/payments" className="px-4 py-2 bg-primary text-white rounded-full">
            العودة إلى المدفوعات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col items-center p-6 md:p-10 lg:p-15">
        <div className="w-full max-w-[708px] flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-row items-center gap-4">
            {/* Title - Right */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 text-right">بيانات الدفع</h1>
            
            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Payment Reference Section */}
          <div className="flex flex-col items-end gap-6">
            <h2 className="text-2xl font-medium text-gray-600">مرجع الدفع</h2>
            
            {/* Payment Info Grid */}
            <div className="flex items-start gap-3 w-full">
              <div className="flex-1 flex flex-col items-end gap-1.5">
                <span className="text-base font-medium text-gray-900">المبلغ</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-end gap-1.5">
                <span className="text-base font-medium text-gray-900">اسم العميل</span>
                <span className="text-base font-bold text-gray-900">
                  {payment.customer?.businessNameAr || payment.customer?.businessName || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Additional Payment Info */}
            <div className="flex items-start gap-6 w-full">
              <div className="flex-1 flex justify-end items-center gap-3">
                <div className="flex-1 flex flex-col items-end gap-1.5">
                  <span className="text-base font-medium text-gray-900">كود الدفع</span>
                  <span className="text-base font-bold text-gray-900">
                    #{payment.paymentNumber}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex justify-end items-center gap-3">
                <div className="flex-1 flex flex-col items-end gap-1.5">
                  <span className="text-base font-medium text-gray-900">طريقة الدفع</span>
                  <span className="text-base font-bold text-gray-900">
                    {getPaymentMethodLabel(payment.method)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status & Date */}
            <div className="flex items-start gap-6 w-full">
              <div className="flex-1 flex flex-col items-end gap-1.5">
                <span className="text-base font-medium text-gray-900">حالة الدفع</span>
                {getPaymentStatusBadge(payment.status)}
              </div>
              
              <div className="flex-1 flex flex-col items-end gap-1.5">
                <span className="text-base font-medium text-gray-900">تاريخ الدفع</span>
                <span className="text-base font-bold text-gray-900">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
            </div>

            {payment.notes && (
              <div className="flex flex-col items-end gap-1.5 w-full">
                <span className="text-base font-medium text-gray-900">ملاحظات</span>
                <span className="text-base text-gray-700">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* Linked Order Section */}
          {payment.order && (
            <div className="flex flex-col items-end gap-6">
              <h2 className="text-2xl font-medium text-gray-600">الطلب المرتبط</h2>
              
              <div className="w-full rounded-lg border border-gray-300 bg-white p-4">
                <div className="flex items-center gap-6">
                  <div className="flex-1 flex flex-col items-end gap-1.5">
                    <span className="text-sm text-gray-600">كود الطلب</span>
                    <Link 
                      to={`/orders/${payment.order.id}`}
                      className="text-base font-bold text-primary underline hover:opacity-80"
                    >
                      #{payment.order.orderNumber}
                    </Link>
                  </div>
                  {payment.order.total && (
                    <div className="flex-1 flex flex-col items-end gap-1.5">
                      <span className="text-sm text-gray-600">مجموع الطلب</span>
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(payment.order.total)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
