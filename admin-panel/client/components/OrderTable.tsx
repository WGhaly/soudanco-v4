import { useState } from "react";

type PaymentStatus = "paid" | "partial" | "failed" | "refunded";

interface Order {
  id: string;
  code: string;
  customerName: string;
  items: string;
  total: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  date: string;
}

const orders: Order[] = [
  {
    id: "1",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "paid",
    date: "30-12-2025",
  },
  {
    id: "2",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "partial",
    date: "30-12-2025",
  },
  {
    id: "3",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "paid",
    date: "30-12-2025",
  },
  {
    id: "4",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "failed",
    date: "30-12-2025",
  },
  {
    id: "5",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "paid",
    date: "30-12-2025",
  },
  {
    id: "6",
    code: "#fc3d37",
    customerName: "ميترو ماركت",
    items: "3 عناصر",
    total: "2,855 جم",
    paymentMethod: "Fawry",
    paymentStatus: "refunded",
    date: "30-12-2025",
  },
];

const statusStyles: Record<PaymentStatus, { bg: string; border: string; text: string; label: string }> = {
  paid: {
    bg: "bg-green-200",
    border: "border-theme-success",
    text: "text-white",
    label: "تم الدفع",
  },
  partial: {
    bg: "bg-orange-200",
    border: "border-brand-primary",
    text: "text-white",
    label: "الدفع جزئيًا",
  },
  failed: {
    bg: "bg-red-300",
    border: "border-theme-danger",
    text: "text-white",
    label: "فشل",
  },
  refunded: {
    bg: "bg-white",
    border: "border-black",
    text: "text-body-text",
    label: "تم الاسترداد",
  },
};

interface MenuState {
  orderId: string | null;
  position: { x: number; y: number };
}

export default function OrderTable() {
  const [menuState, setMenuState] = useState<MenuState>({ orderId: null, position: { x: 0, y: 0 } });

  const handleMenuToggle = (orderId: string, event: React.MouseEvent) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    
    if (menuState.orderId === orderId) {
      setMenuState({ orderId: null, position: { x: 0, y: 0 } });
    } else {
      setMenuState({
        orderId,
        position: { x: rect.left, y: rect.bottom },
      });
    }
  };

  return (
    <div className="flex flex-col items-end gap-4 md:gap-6 self-stretch">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 md:gap-6 self-stretch">
        <button className="flex justify-start items-center gap-2">
          <span className="text-brand-primary font-sf text-sm font-medium leading-5 mr-auto">عرض الكل</span>
          <div className="flex flex-col justify-center items-center mr-auto">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3L9 8L4 13" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
        <h2 className="text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%] ml-auto">
          الطلبات الواردة
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5 pt-2.5 overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center gap-4 lg:gap-[30px] self-stretch rounded-lg bg-theme-border px-2.5 py-2.5 min-w-[800px]">
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">كود الطلب</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">اسم العميل</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">العناصر</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">المجموع</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">طريقة الدفع</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">حالة الدفع</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">التاريخ</div>
          <div className="w-8 p-2"></div>
        </div>

        {/* Table Rows */}
        {orders.map((order, index) => {
          const status = statusStyles[order.paymentStatus];
          const isLast = index === orders.length - 1;

          return (
            <div
              key={order.id}
              className={`flex items-center gap-4 self-stretch bg-white px-2.5 py-5 min-w-[800px] ${!isLast ? 'border-b border-theme-border' : ''}`}
            >
              <div className="flex flex-col justify-center items-center flex-1">
                <div className="self-stretch text-body-text text-right text-base font-normal leading-[130%] underline">
                  {order.code}
                </div>
              </div>
              <div className="flex justify-end items-center gap-2.5 flex-1">
                <div className="text-body-text text-right text-base font-normal leading-[130%]">
                  {order.customerName}
                </div>
              </div>
              <div className="flex-1 text-body-text text-right text-base font-normal leading-[130%]">
                {order.items}
              </div>
              <div className="flex-1 text-body-text text-right text-base font-bold leading-[150%]">
                {order.total}
              </div>
              <div className="flex-1 text-body-text text-right text-base font-normal leading-[130%]">
                {order.paymentMethod}
              </div>
              <div className="flex-1">
                <div
                  className={`flex justify-center items-center gap-1.5 rounded-full border px-3 py-1 ${status.bg} ${status.border} ${status.text}`}
                >
                  <span className="text-center text-sm font-normal leading-[150%]">{status.label}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center flex-1">
                <div className="self-stretch text-gray-500 text-right text-base font-normal leading-[130%]">
                  {order.date}
                </div>
              </div>
              <div className="flex flex-col items-start p-2 relative">
                <button
                  onClick={(e) => handleMenuToggle(order.id, e)}
                  className="flex flex-col justify-center items-center cursor-pointer hover:opacity-70"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="flex md:hidden flex-col gap-3 self-stretch">
        {orders.map((order) => {
          const status = statusStyles[order.paymentStatus];

          return (
            <div
              key={order.id}
              className="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`flex justify-center items-center gap-1.5 rounded-full border px-3 py-1 ${status.bg} ${status.border} ${status.text}`}
                >
                  <span className="text-center text-sm font-normal leading-[150%]">{status.label}</span>
                </div>
                <button
                  onClick={(e) => handleMenuToggle(order.id, e)}
                  className="p-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-body-text font-bold">{order.total}</span>
                  <span className="text-gray-secondary">المجموع:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text">{order.customerName}</span>
                  <span className="text-gray-secondary">العميل:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text underline">{order.code}</span>
                  <span className="text-gray-secondary">الكود:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text">{order.items}</span>
                  <span className="text-gray-secondary">العناصر:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text">{order.paymentMethod}</span>
                  <span className="text-gray-secondary">طريقة الدفع:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{order.date}</span>
                  <span className="text-gray-secondary">التاريخ:</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {menuState.orderId && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuState({ orderId: null, position: { x: 0, y: 0 } })}
          />
          <div
            className="fixed z-20 flex flex-col items-start rounded-2xl bg-white shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] py-3"
            style={{
              left: `${menuState.position.x}px`,
              top: `${menuState.position.y + 5}px`,
            }}
          >
            <button className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors">
              <div className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">تعديل</div>
            </button>
            <button className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors">
              <div className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">عرض</div>
            </button>
            <button className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors">
              <div className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">حذف</div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
