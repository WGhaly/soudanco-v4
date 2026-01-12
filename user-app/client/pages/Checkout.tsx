import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<"advance" | "partial" | "deferred">("advance");

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const cart = cartData?.data;

  // Create order mutation
  const createOrder = useCreateOrder();

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('ar-EG')} جم`;
  };

  const handleCompletePayment = async () => {
    createOrder.mutate(
      { notes: `نوع الدفع: ${paymentType === 'advance' ? 'دفع مسبق' : paymentType === 'partial' ? 'دفع جزئي' : 'دفع آجل'}` },
      {
        onSuccess: () => {
          navigate("/orders");
        },
        onError: (error) => {
          alert(`فشل في إتمام الطلب: ${error.message}`);
        }
      }
    );
  };

  const handleCancelOrder = () => {
    if (confirm("هل تريد إلغاء الطلب؟")) {
      navigate("/products");
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (cartError || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-red-500">فشل في تحميل السلة</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <div className="flex flex-col p-5 pb-6 items-end gap-6">
          <PageHeader title="إتمام الشراء" />
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-gray-500 text-lg">السلة فارغة</p>
            <button 
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-brand-primary text-white rounded-full"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <div className="flex flex-col p-5 pb-6 items-end gap-6">
        <PageHeader title="إتمام الشراء" />
        
        {/* Order Review */}
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            مراجعة الطلبية
          </h2>
          
          <div className="flex flex-col items-end w-full">
            <div className="flex p-3 flex-col items-center gap-[15px] w-full rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.2)]">
              {cart.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex pb-3 flex-col justify-center items-end gap-3 w-full ${
                    index < cart.items.length - 1 ? "border-b border-[#DEE2E6]" : ""
                  }`}
                >
                  <div className="flex flex-row items-start gap-3 w-full justify-end">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/62x66"}
                      alt={item.productNameAr || item.productName}
                      className="w-[62px] h-[66px] rounded-lg object-cover"
                    />
                    <div className="flex flex-col items-end gap-1.5 flex-1">
                      <span className="text-[#363636] text-right text-base font-normal leading-[130%] w-full">
                        {item.productNameAr || item.productName}
                      </span>
                      <span className="text-[#CED4DA] text-right text-sm font-normal leading-[150%] w-full">
                        {item.unit} × {item.quantity}
                      </span>
                      <span className="text-[#212529] text-right text-sm font-medium leading-[120%] w-full">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Delivery Address */}
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            عنوان التوصيل
          </h2>
          
          <button
            onClick={() => navigate("/address")}
            className="flex p-4 flex-col justify-center items-center gap-6 w-full rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_0_rgba(0,0,0,0.15)] transition-shadow"
          >
            <div className="flex flex-col items-end gap-3 w-full">
              <div className="flex flex-row-reverse items-center gap-1.5 w-full max-sm:justify-end max-sm:items-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="max-sm:mr-auto max-sm:flex max-sm:flex-col max-sm:items-stretch">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.3536 1.64645C11.5488 1.84171 11.5488 2.15829 11.3536 2.35355L5.70711 8L11.3536 13.6464C11.5488 13.8417 11.5488 14.1583 11.3536 14.3536C11.1583 14.5488 10.8417 14.5488 10.6464 14.3536L4.64645 8.35355C4.45118 8.15829 4.45118 7.84171 4.64645 7.64645L10.6464 1.64645C10.8417 1.45118 11.1583 1.45118 11.3536 1.64645Z" fill="#6C757D"/>
                </svg>
                <div className="max-sm:flex max-sm:flex-row"></div>
                <span className="text-[#212529] text-right text-base font-normal leading-[130%] max-sm:ml-auto">
                  الوحدة العلية
                </span>
                <div className="flex justify-end items-center flex-1 max-sm:w-auto max-sm:flex-grow-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.1658 8.93977C11.6418 10.0015 10.9325 11.0601 10.2058 12.01C9.48132 12.957 8.75442 13.7768 8.20768 14.3605C8.13503 14.438 8.06566 14.5113 8 14.5801C7.93434 14.5113 7.86497 14.438 7.79232 14.3605C7.24558 13.7768 6.51868 12.957 5.79425 12.01C5.06754 11.0601 4.35825 10.0015 3.83423 8.93977C3.3048 7.86708 3 6.86191 3 6C3 3.23858 5.23858 1 8 1C10.7614 1 13 3.23858 13 6C13 6.86191 12.6952 7.86708 12.1658 8.93977ZM8 16C8 16 14 10.3137 14 6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6C2 10.3137 8 16 8 16Z" fill="#FD7E14"/>
                    <path d="M8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8ZM8 9C9.65685 9 11 7.65685 11 6C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6C5 7.65685 6.34315 9 8 9Z" fill="#FD7E14"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 w-full px-3">
                <span className="text-[#CED4DA] text-right text-sm font-normal leading-[150%] w-full">
                  <span className="text-[#212529] font-medium">اسم المسوؤل</span><br />
                  15 شارع بيروتو الكوربة, هليوبوليس , مصر الجديدة
                </span>
              </div>
            </div>
          </button>
        </div>
        
        {/* Payment Method */}
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            وسيلة الدفع
          </h2>
          
          <button
            onClick={() => navigate("/payment")}
            className="flex flex-row-reverse px-4 py-2.5 justify-end items-center gap-2.5 w-full rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_0_rgba(0,0,0,0.15)] transition-shadow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.3536 1.64645C11.5488 1.84171 11.5488 2.15829 11.3536 2.35355L5.70711 8L11.3536 13.6464C11.5488 13.8417 11.5488 14.1583 11.3536 14.3536C11.1583 14.5488 10.8417 14.5488 10.6464 14.3536L4.64645 8.35355C4.45118 8.15829 4.45118 7.84171 4.64645 7.64645L10.6464 1.64645C10.8417 1.45118 11.1583 1.45118 11.3536 1.64645Z" fill="#6C757D"/>
            </svg>
            <div className="flex flex-col justify-center items-end flex-1">
              <span className="text-[#363636] text-right text-base font-normal leading-[130%] w-full">
                Master card
              </span>
              <span className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
                .... 2544
              </span>
            </div>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/038a9121ec56823bfad89a24826e1b1af5ebbe78"
              alt="Mastercard"
              className="w-10 h-6 rounded-md"
            />
          </button>
        </div>
        
        {/* Payment Type */}
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            نوع الدفع
          </h2>
          
          <button
            onClick={() => setPaymentType("advance")}
            className="flex flex-row p-1 py-0 justify-end items-start gap-3 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
          >
            <div className="w-8 h-[17px] max-sm:h-[18px] max-sm:flex max-sm:flex-col">
              <div className={`w-8 h-[17px] rounded-[20px] border-2 ${paymentType === "advance" ? "border-[#FD7E14] bg-[#FD7E14]" : "border-[#FD7E14]"} relative`}>
                <div className={`w-[13px] h-[14px] rounded-[20px] ${paymentType === "advance" ? "bg-white left-0.5 max-sm:top-0 max-sm:left-0 max-sm:m-auto" : "bg-[#FD7E14] left-[17px] max-sm:top-0 max-sm:left-0 max-sm:m-auto"} absolute top-0.5`}></div>
              </div>
            </div>
            <span className="flex-1 text-[#363636] text-right text-base font-medium leading-[120%]">
              الدفع المسبق
            </span>
          </button>
          
          <button
            onClick={() => setPaymentType("partial")}
            className="flex flex-row p-1 py-0 justify-end items-start gap-3 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
          >
            <div className="w-8 h-[17px] max-sm:h-[18px] max-sm:flex max-sm:flex-col">
              <div className={`w-8 h-[17px] rounded-[20px] border-2 ${paymentType === "partial" ? "border-[#FD7E14] bg-[#FD7E14]" : "border-[#FD7E14]"} relative`}>
                <div className={`w-[13px] h-[14px] rounded-[20px] ${paymentType === "partial" ? "bg-white left-0.5 max-sm:top-0 max-sm:left-0 max-sm:m-auto" : "bg-[#FD7E14] left-[17px] max-sm:top-0 max-sm:left-[14px] max-sm:m-auto"} absolute top-0.5`}></div>
              </div>
            </div>
            <span className="flex-1 text-[#363636] text-right text-base font-medium leading-[120%]">
              الدفع الجزئي
            </span>
          </button>
          
          <button
            onClick={() => setPaymentType("deferred")}
            className="flex flex-row p-1 py-0 justify-end items-start gap-3 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
          >
            <div className="w-8 h-[17px] max-sm:h-[18px]">
              <div className={`w-8 h-[17px] rounded-[20px] border-2 ${paymentType === "deferred" ? "border-[#FD7E14] bg-[#FD7E14]" : "border-[#FD7E14]"} relative`}>
                <div className={`w-[13px] h-[14px] rounded-[20px] ${paymentType === "deferred" ? "bg-white left-0.5 max-sm:top-0 max-sm:left-[14px]" : "bg-[#FD7E14] left-[17px] max-sm:top-0 max-sm:left-[14px]"} absolute top-0.5`}></div>
              </div>
            </div>
            <span className="flex-1 text-[#363636] text-right text-base font-medium leading-[120%]">
              الدفع الآجل
            </span>
          </button>
        </div>
      </div>
      
      {/* Order Summary Footer */}
      <div className="flex px-4 pt-[21px] pb-4 flex-col justify-end items-end gap-7 w-full bg-white shadow-[0_-11px_25px_0_rgba(0,0,0,0.12)]">
        <div className="flex px-6 flex-col items-end gap-[26px] w-full">
          <div className="flex flex-col items-end gap-[23px] w-full">
            <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
              <span className="text-[#262626] text-base font-normal leading-[130%]">{formatCurrency(cart.subtotal)}</span>
              <span className="flex-1 text-[#262626] text-right text-base font-normal leading-[130%]">المجموع الفرعي ({cart.itemCount} منتج)</span>
            </div>
            <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
              <span className="text-[#75B798] text-sm font-medium leading-[120%]">توصيل مجاني</span>
              <span className="flex-1 text-[#262626] text-right text-base font-normal leading-[130%]">التوصيل</span>
            </div>
          </div>
          <div className="flex flex-row-reverse justify-between items-center w-full">
            <span className="text-[#FD7E14] text-xl font-medium leading-[120%]">{formatCurrency(cart.subtotal)}</span>
            <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">المجموع الكلي</span>
          </div>
        </div>
        
        <div className="flex px-6 flex-col items-end gap-4 w-full">
          <button
            onClick={handleCancelOrder}
            disabled={createOrder.isPending}
            className="flex px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] disabled:opacity-50 transition-colors"
          >
            <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
              الغاء الطلب
            </span>
          </button>
          <button
            onClick={handleCompletePayment}
            disabled={createOrder.isPending}
            className="flex px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full bg-[#FD7E14] hover:bg-[#E56D04] disabled:bg-[#ADB5BD] transition-colors active:scale-95"
          >
            {createOrder.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <span className="text-white text-center text-base font-normal leading-[130%]">
                اتمام الدفع
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
