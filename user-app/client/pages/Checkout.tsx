import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAddresses, useDashboard } from "@/hooks/useProfile";

export default function Checkout() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dashboard data for wallet/credit info
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const dashboard = dashboardData?.data;

  // Fetch cart data
  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const cart = cartData?.data;

  // Fetch addresses
  const { data: addressesData } = useAddresses();
  const addresses = addressesData?.data || [];
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  // Create order mutation
  const createOrder = useCreateOrder();

  const formatCurrency = (amount: string | number | undefined | null) => {
    if (amount === undefined || amount === null) return '0 جم';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 جم';
    return `${num.toLocaleString('ar-EG')} جم`;
  };

  // Calculate wallet and credit info
  const walletBalance = parseFloat(dashboard?.walletBalance || '0');
  const creditLimit = parseFloat(dashboard?.creditLimit || '0');
  const creditUsed = parseFloat(dashboard?.currentBalance || '0');
  const availableCredit = creditLimit - creditUsed;
  const totalAvailable = walletBalance + availableCredit;
  const orderTotal = parseFloat(cart?.summary?.total || cart?.summary?.subtotal || '0');
  const canAffordOrder = totalAvailable >= orderTotal;

  // Calculate payment breakdown
  const walletDeduction = Math.min(walletBalance, orderTotal);
  const creditDeduction = orderTotal - walletDeduction;

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!canAffordOrder) {
      navigate('/wallet');
      return;
    }

    setIsSubmitting(true);
    createOrder.mutate(
      { 
        addressId: defaultAddress?.id,
        notes: '' 
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          navigate("/orders");
        },
        onError: (error) => {
          setIsSubmitting(false);
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

  if (cartLoading || dashboardLoading) {
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
      <div className="flex flex-col p-5 pb-6 items-end gap-6 flex-1 overflow-auto">
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
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productNameAr || item.productName}
                        className="w-[62px] h-[66px] rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-[62px] h-[66px] rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="#FD7E14" strokeWidth="2"/>
                          <path d="M21 15L16 10L5 21" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col items-end gap-1.5 flex-1">
                      <span className="text-[#363636] text-right text-base font-normal leading-[130%] w-full">
                        {item.productNameAr || item.productName}
                      </span>
                      <span className="text-[#CED4DA] text-right text-sm font-normal leading-[150%] w-full whitespace-nowrap">
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
            {defaultAddress ? (
              <div className="flex flex-col items-end gap-3 w-full">
                <div className="flex flex-row-reverse items-center gap-1.5 w-full max-sm:justify-end max-sm:items-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="max-sm:mr-auto max-sm:flex max-sm:flex-col max-sm:items-stretch">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.3536 1.64645C11.5488 1.84171 11.5488 2.15829 11.3536 2.35355L5.70711 8L11.3536 13.6464C11.5488 13.8417 11.5488 14.1583 11.3536 14.3536C11.1583 14.5488 10.8417 14.5488 10.6464 14.3536L4.64645 8.35355C4.45118 8.15829 4.45118 7.84171 4.64645 7.64645L10.6464 1.64645C10.8417 1.45118 11.1583 1.45118 11.3536 1.64645Z" fill="#6C757D"/>
                  </svg>
                  <span className="text-[#212529] text-right text-base font-normal leading-[130%] max-sm:ml-auto">
                    {defaultAddress.label}
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
                    {defaultAddress.addressLine1}
                    {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}
                    {`, ${defaultAddress.city}`}
                    {defaultAddress.region && `, ${defaultAddress.region}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full py-2">
                <span className="text-[#6C757D] text-center text-sm">لا يوجد عنوان محدد</span>
                <span className="text-[#FD7E14] text-center text-sm font-medium">إضافة عنوان</span>
              </div>
            )}
          </button>
        </div>
        
        {/* Payment Info - Wallet & Credit */}
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            طريقة الدفع
          </h2>
          
          <div className="flex p-4 flex-col gap-4 w-full rounded-xl border border-[#DEE2E6] bg-white">
            {/* Wallet Balance */}
            <div className="flex flex-row-reverse justify-between items-center w-full">
              <div className="flex flex-row-reverse items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 6.66667H2.5V15.8333H17.5V6.66667Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 6.66667L3.75 3.33333H16.25L17.5 6.66667" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[#212529] text-right text-sm font-medium">رصيد المحفظة</span>
              </div>
              <span className="text-[#FD7E14] font-bold">{formatCurrency(walletBalance)}</span>
            </div>
            
            {/* Available Credit */}
            <div className="flex flex-row-reverse justify-between items-center w-full">
              <div className="flex flex-row-reverse items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="#28A745" strokeWidth="1.5"/>
                  <path d="M10 6.66667V10L12.5 12.5" stroke="#28A745" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[#212529] text-right text-sm font-medium">الائتمان المتاح</span>
              </div>
              <span className="text-[#28A745] font-bold">{formatCurrency(availableCredit)}</span>
            </div>
            
            <div className="h-px bg-[#DEE2E6]"></div>
            
            {/* Total Available */}
            <div className="flex flex-row-reverse justify-between items-center w-full">
              <span className="text-[#212529] text-right font-medium">إجمالي الرصيد المتاح</span>
              <span className={`text-xl font-bold ${canAffordOrder ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>
                {formatCurrency(totalAvailable)}
              </span>
            </div>
            
            {/* Insufficient Balance Warning */}
            {!canAffordOrder && (
              <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 text-sm text-right">
                  الرصيد غير كافٍ لإتمام هذا الطلب
                </span>
                <span className="text-red-500 text-xs text-right">
                  المطلوب: {formatCurrency(orderTotal)} | المتاح: {formatCurrency(totalAvailable)} | الفرق: {formatCurrency(orderTotal - totalAvailable)}
                </span>
              </div>
            )}
            
            {/* Payment Breakdown (if can afford) */}
            {canAffordOrder && orderTotal > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-[#E7F3FF] rounded-lg">
                <span className="text-[#0D6EFD] text-sm font-medium text-right">سيتم الخصم كالتالي:</span>
                {walletDeduction > 0 && (
                  <div className="flex flex-row-reverse justify-between">
                    <span className="text-[#0D6EFD] text-xs">من المحفظة</span>
                    <span className="text-[#0D6EFD] text-xs font-medium">{formatCurrency(walletDeduction)}</span>
                  </div>
                )}
                {creditDeduction > 0 && (
                  <div className="flex flex-row-reverse justify-between">
                    <span className="text-[#0D6EFD] text-xs">من الائتمان</span>
                    <span className="text-[#0D6EFD] text-xs font-medium">{formatCurrency(creditDeduction)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Summary Footer */}
      <div className="flex px-4 pt-[21px] pb-4 flex-col justify-end items-end gap-4 w-full bg-white shadow-[0_-11px_25px_0_rgba(0,0,0,0.12)]">
        <div className="flex px-6 flex-col items-end gap-4 w-full">
          {/* Applied Discounts */}
          {cart.appliedDiscounts && cart.appliedDiscounts.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              {cart.appliedDiscounts.map((discount: any) => (
                <div key={discount.id} className="flex flex-row-reverse justify-between items-center w-full p-2 rounded-lg bg-[#E8F5E9]">
                  <div className="flex flex-col items-end">
                    <span className="text-[#2E7D32] text-sm font-medium">
                      🎉 {discount.nameAr || discount.name}
                    </span>
                    {discount.description && (
                      <span className="text-[#4CAF50] text-xs">
                        {discount.description}
                      </span>
                    )}
                  </div>
                  <span className="text-[#2E7D32] text-sm font-bold">
                    -{discount.discountAmount} جم
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-end gap-3 w-full">
            <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
              <span className="text-[#262626] text-base font-normal leading-[130%]">{formatCurrency(cart.summary?.subtotal || '0')}</span>
              <span className="flex-1 text-[#262626] text-right text-base font-normal leading-[130%]">المجموع الفرعي ({cart.summary?.itemCount || cart.items.length} منتج)</span>
            </div>

            {/* Discount if any */}
            {parseFloat(cart.summary?.discount || '0') > 0 && (
              <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
                <span className="text-[#2E7D32] text-base font-medium">-{formatCurrency(cart.summary?.discount || '0')}</span>
                <span className="flex-1 text-[#2E7D32] text-right text-base font-normal leading-[130%]">الخصم</span>
              </div>
            )}

            <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
              <span className="text-[#75B798] text-sm font-medium leading-[120%]">توصيل مجاني</span>
              <span className="flex-1 text-[#262626] text-right text-base font-normal leading-[130%]">التوصيل</span>
            </div>
          </div>
          <div className="flex flex-row-reverse justify-between items-center w-full">
            <span className="text-[#FD7E14] text-xl font-medium leading-[120%]">{formatCurrency(orderTotal)}</span>
            <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">المجموع الكلي</span>
          </div>
        </div>
        
        <div className="flex px-6 flex-col items-end gap-3 w-full">
          <button
            onClick={handleCancelOrder}
            disabled={isSubmitting}
            className="flex px-4 py-2 justify-center items-center gap-1.5 w-full rounded-full border border-[#6C757D] text-[#6C757D] hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <span className="text-center text-base font-normal leading-[130%]">
              إلغاء الطلب
            </span>
          </button>
          
          {canAffordOrder ? (
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="flex px-4 py-3 justify-center items-center gap-2 w-full rounded-full bg-[#FD7E14] hover:bg-[#E56D04] disabled:bg-[#ADB5BD] transition-colors active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="text-white text-center text-base font-medium leading-[130%]">جاري تأكيد الطلب...</span>
                </>
              ) : (
                <span className="text-white text-center text-base font-medium leading-[130%]">
                  تأكيد الطلب
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate('/wallet')}
              className="flex px-4 py-3 justify-center items-center gap-2 w-full rounded-full bg-[#28A745] hover:bg-[#218838] transition-colors active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 6.66667H2.5V15.8333H17.5V6.66667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10V13.3333M10 10L7.5 12.5M10 10L12.5 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white text-center text-base font-medium leading-[130%]">
                شحن المحفظة
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
