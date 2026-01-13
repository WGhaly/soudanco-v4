import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useCustomer } from "@/hooks/useCustomers";
import { usePayments } from "@/hooks/usePayments";
import { useOrders } from "@/hooks/useOrders";

type TabType = "profile" | "balance" | "orders";

type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

interface PaymentRecord {
  id: string;
  date: string;
  status: PaymentStatus;
  reference: string;
  method: string;
  amount: string;
}

// Payments are now fetched from API

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const configs: Record<PaymentStatus, { label: string; classes: string }> = {
    pending: {
      label: "قيد الانتظار",
      classes: "border-brand-primary bg-orange-200 text-body-text"
    },
    completed: {
      label: "تم الدفع",
      classes: "border-theme-success bg-green-200 text-body-text"
    },
    failed: {
      label: "فشل",
      classes: "border-theme-danger bg-red-300 text-white"
    },
    refunded: {
      label: "تم الاسترداد",
      classes: "border-black text-body-text"
    }
  };

  const config = configs[status] || configs.pending;

  return (
    <div className={`flex justify-center items-center px-3 py-1 rounded-full border ${config.classes}`}>
      <span className="text-center text-sm font-normal leading-[150%]">{config.label}</span>
    </div>
  );
}

export default function CustomerDetails() {
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Fetch customer data
  const { data: customerData, isLoading: customerLoading, error: customerError } = useCustomer(id || '');
  const customer = customerData?.data;

  // Local state for isActive toggle (derived from customer.isActive)
  const [isActive, setIsActive] = useState(true);

  // Update local state when customer data loads
  if (customer && isActive !== customer.isActive) {
    setIsActive(customer.isActive);
  }

  // Fetch customer payments
  const { data: paymentsData } = usePayments(1, 10, { customerId: id });
  const payments = paymentsData?.data || [];

  // Fetch customer orders
  const { data: ordersData } = useOrders(1, 10, { customerId: id });
  const orders = ordersData?.data || [];

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

  if (customerLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-xl">حدث خطأ في تحميل بيانات العميل</p>
          <Link to="/customers" className="px-4 py-2 bg-brand-primary text-white rounded-full">
            العودة إلى العملاء
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 shadow-md sticky top-0 z-30">
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
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="flex flex-col items-center flex-1 w-full">
          <div className="flex flex-col items-end gap-6 md:gap-8 w-full">
            {/* Page Header */}
            <div className="flex flex-col items-end gap-6 md:gap-8 self-stretch">
              <div className="flex justify-between items-center self-stretch">
                <div className="flex items-center gap-3">
                  <Link
                    to="/customers"
                    className="flex w-10 h-10 justify-center items-center rounded-full bg-brand-primary hover:opacity-90"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 15L6 10L11 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <button className="flex justify-center items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1.5 transition-opacity hover:opacity-90">
                    <span className="text-white text-center text-base font-normal leading-[130%]">تعديل البيانات</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.6663 2.33337L11.333 2.00004Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <h1 className="text-brand-primary text-right text-2xl md:text-[32px] font-medium leading-[120%]">
                  بيانات العميل
                </h1>
              </div>

              <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                {customer.businessNameAr || customer.businessName}
              </h2>

              {/* Tabs */}
              <div className="flex justify-end items-start gap-6 self-stretch">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex flex-col justify-center items-center gap-2.5 flex-1 rounded-lg px-4 py-3 ${
                    activeTab === "orders" ? "bg-brand-primary/10" : "bg-theme-border"
                  }`}
                >
                  <span
                    className={`self-stretch text-center text-base font-medium leading-[120%] ${
                      activeTab === "orders" ? "text-brand-primary" : "text-body-text"
                    }`}
                  >
                    الطلبات
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("balance")}
                  className={`flex flex-col justify-center items-center gap-2.5 flex-1 rounded-lg px-4 py-3 ${
                    activeTab === "balance" ? "bg-brand-primary/10" : "bg-theme-border"
                  }`}
                >
                  <span
                    className={`self-stretch text-center text-base font-medium leading-[120%] ${
                      activeTab === "balance" ? "text-brand-primary" : "text-body-text"
                    }`}
                  >
                    الرصيد والائتمان
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex flex-col justify-center items-center gap-2.5 flex-1 rounded-lg px-4 py-3 ${
                    activeTab === "profile" ? "bg-brand-primary/10" : "bg-theme-border"
                  }`}
                >
                  <span
                    className={`self-stretch text-center text-base font-medium leading-[120%] ${
                      activeTab === "profile" ? "text-brand-primary" : "text-body-text"
                    }`}
                  >
                    الملف الشخصي
                  </span>
                </button>
              </div>
            </div>

            {/* Profile Tab Content */}
            {activeTab === "profile" && (
              <>
                {/* Customer Information Section */}
                <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                  <h3 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                    معلومات العميل
                  </h3>

                  <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">المنطقة</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {customer.addresses?.[0]?.region || customer.addresses?.[0]?.city || 'غير محدد'}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-right text-base font-medium leading-[120%]">الاسم</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {customer.businessNameAr || customer.businessName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-right text-base font-medium leading-[120%]">رقم الهاتف</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {customer.phone || 'غير محدد'}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-right text-base font-medium leading-[120%]">البريد الالكتروني</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {customer.email || 'غير محدد'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                    <div className="flex justify-end items-center gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 flex-1">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">تفعيل الحساب</label>
                      </div>
                      <button
                        onClick={() => setIsActive(!isActive)}
                        className="relative w-8 h-[17px]"
                      >
                        {isActive ? (
                          <div className="relative w-8 h-[17px]">
                            <div className="absolute w-8 h-[17px] rounded-full border-2 border-brand-primary bg-brand-primary"></div>
                            <div className="absolute w-3.5 h-3.5 rounded-full bg-white left-[17px] top-0.5"></div>
                          </div>
                        ) : (
                          <div className="relative w-8 h-[17px]">
                            <svg className="absolute w-8 h-[17px]" viewBox="0 0 37 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M25.7998 1C31.0465 1 35.2998 5.25329 35.2998 10.5C35.2998 15.7467 31.0465 20 25.7998 20H10.5C5.2533 20 1 15.7467 1 10.5C1 5.25329 5.2533 1 10.5 1H25.7998Z" stroke="#FD7E14" strokeWidth="2"/>
                            </svg>
                            <div className="absolute w-3.5 h-3.5 rounded-full bg-brand-primary left-0.5 top-0.5"></div>
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">قائمة الاسعار</label>
                      </div>
                      <div className="flex justify-center items-center gap-2.5 self-stretch">
                        <div className="flex-1 text-body-text text-right text-base font-bold leading-[150%]">
                          الفضي
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Information Section */}
                <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                  <h3 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                    بيانات تسجيل الدخول
                  </h3>

                  <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                    <div className="flex flex-col items-start gap-3 w-full md:w-[388px]">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-right text-base font-medium leading-[120%]">البريد الالكتروني</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        elnourmarket@cairo.com
                      </div>
                    </div>

                    <button className="flex justify-center items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1.5 transition-opacity hover:opacity-90">
                      <span className="text-white text-center text-base font-normal leading-[130%]">
                        إعادة تعيين كلمة المرور
                      </span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.8333 9.16667C15.8333 5.02453 12.4755 1.66667 8.33333 1.66667C4.19117 1.66667 0.833332 5.02453 0.833332 9.16667C0.833332 13.3088 4.19117 16.6667 8.33333 16.6667H15.8333M15.8333 16.6667L13.3333 14.1667M15.8333 16.6667L13.3333 19.1667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Balance & Credit Tab Content */}
            {activeTab === "balance" && (
              <>
                {/* Credit Information Section */}
                <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                  <h3 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                    معلومات الرصيد و الاتمان
                  </h3>

                  <div className="flex flex-col md:flex-row items-start gap-6 self-stretch">
                    <div className="flex flex-col items-start gap-1.5 flex-1 rounded-2xl bg-white px-6 py-2">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">الرصيد المتاح</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        7,500 EGP
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 flex-1 rounded-2xl bg-white px-6 py-2">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">حد الائتمان</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {formatCurrency(customer?.creditLimit || 0)}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 flex-1 rounded-2xl bg-white px-6 py-2">
                      <div className="flex justify-end items-start gap-1 self-stretch">
                        <label className="text-new-black-color text-base font-medium leading-[120%]">الرصيد المستحق</label>
                      </div>
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {formatCurrency(customer?.currentBalance || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History Section */}
                <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                  <h3 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                    سجل المدفوعات
                  </h3>

                  <div className="flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5 pt-2.5 overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full">
                      <thead>
                        <tr className="bg-theme-border rounded-lg">
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">تاريخ العملية</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">حالة الدفع</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal">المرجع</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal">طريقة الدفع</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-2.5 py-8 text-center text-gray-500">لا توجد مدفوعات</td>
                          </tr>
                        ) : (
                          payments.map((payment: any) => (
                            <tr key={payment.id} className="border-b border-theme-border last:border-b-0">
                              <td className="px-2.5 py-3 text-center text-gray-500 text-base font-normal leading-[130%]">{formatDate(payment.createdAt)}</td>
                              <td className="px-2.5 py-3">
                                <PaymentStatusBadge status={payment.status} />
                              </td>
                              <td className="px-2.5 py-3 text-right text-body-text text-base font-normal leading-[130%] underline">
                                <Link to={`/payments/${payment.id}`}>{payment.paymentNumber}</Link>
                              </td>
                              <td className="px-2.5 py-3 text-right text-body-text text-base font-normal leading-[130%]">{getPaymentMethodLabel(payment.method)}</td>
                              <td className="px-2.5 py-3 text-right text-body-text text-base font-bold leading-[150%]">{formatCurrency(payment.amount)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col gap-4 w-full">
                      {payments.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">لا توجد مدفوعات</div>
                      ) : (
                        payments.map((payment: any) => (
                          <div key={payment.id} className="flex flex-col gap-2 p-4 rounded-lg border border-theme-border bg-white">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-sm">{formatDate(payment.createdAt)}</span>
                              <PaymentStatusBadge status={payment.status} />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-body-text text-sm">{getPaymentMethodLabel(payment.method)}</span>
                              <Link to={`/payments/${payment.id}`} className="text-body-text text-sm underline">{payment.paymentNumber}</Link>
                            </div>
                            <div className="text-right text-body-text text-base font-bold">{formatCurrency(payment.amount)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-1 self-stretch">
                  <button className="flex w-11 h-11 justify-center items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="flex w-11 h-11 justify-center items-center text-body-text text-base font-bold leading-[150%]">
                    1
                  </button>
                  <button className="flex w-11 h-11 justify-center items-center text-brand-primary text-base font-bold leading-[150%]">
                    2
                  </button>
                  <button className="flex w-11 h-11 justify-center items-center text-body-text text-base font-bold leading-[150%]">
                    3
                  </button>
                  <button className="flex w-11 h-11 justify-center items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Orders Tab Content */}
            {activeTab === "orders" && (
              <>
                {orders.length === 0 ? (
                  <div className="flex flex-col justify-center items-center gap-6 self-stretch py-12">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11L12 14L22 4" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-gray-secondary text-xl text-center">لا توجد طلبات حتى الآن</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5 overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full">
                      <thead>
                        <tr className="bg-theme-border rounded-lg">
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">رقم الطلب</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal leading-[150%]">تاريخ الطلب</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal">الحالة</th>
                          <th className="px-2.5 py-2.5 text-right text-gray-secondary text-sm font-normal">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr key={order.id} className="border-b border-theme-border last:border-b-0">
                            <td className="px-2.5 py-3 text-right text-body-text text-base font-normal leading-[130%] underline">
                              <Link to={`/orders/${order.id}`}>{order.orderNumber}</Link>
                            </td>
                            <td className="px-2.5 py-3 text-center text-gray-500 text-base font-normal leading-[130%]">{formatDate(order.createdAt)}</td>
                            <td className="px-2.5 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                order.status === 'delivered' ? 'bg-green-200 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                                order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {order.status === 'pending' ? 'قيد الانتظار' :
                                 order.status === 'confirmed' ? 'تم التأكيد' :
                                 order.status === 'processing' ? 'قيد التحضير' :
                                 order.status === 'shipped' ? 'قيد الشحن' :
                                 order.status === 'delivered' ? 'تم التسليم' :
                                 order.status === 'cancelled' ? 'ملغي' : order.status}
                              </span>
                            </td>
                            <td className="px-2.5 py-3 text-right text-body-text text-base font-bold leading-[150%]">{formatCurrency(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col gap-4 w-full">
                      {orders.map((order: any) => (
                        <div key={order.id} className="flex flex-col gap-2 p-4 rounded-lg border border-theme-border bg-white">
                          <div className="flex justify-between items-center">
                            <Link to={`/orders/${order.id}`} className="text-body-text text-base underline">{order.orderNumber}</Link>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.status === 'delivered' ? 'bg-green-200 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                              order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {order.status === 'pending' ? 'قيد الانتظار' :
                               order.status === 'confirmed' ? 'تم التأكيد' :
                               order.status === 'processing' ? 'قيد التحضير' :
                               order.status === 'shipped' ? 'قيد الشحن' :
                               order.status === 'delivered' ? 'تم التسليم' :
                               order.status === 'cancelled' ? 'ملغي' : order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">{formatDate(order.createdAt)}</span>
                            <span className="text-body-text text-base font-bold">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
