import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { usePaymentMethods, useDeletePaymentMethod } from "@/hooks/useProfile";

export default function PaymentMethods() {
  // Fetch payment methods from API
  const { data: methodsData, isLoading, error } = usePaymentMethods();
  const methods = methodsData?.data || [];
  
  const deleteMethod = useDeletePaymentMethod();

  const handleDeleteMethod = (id: string) => {
    if (confirm('هل تريد حذف وسيلة الدفع هذه؟')) {
      deleteMethod.mutate(id);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit_card: 'بطاقة ائتمان',
      bank_transfer: 'تحويل بنكي',
      cash: 'نقدي',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FD7E14]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-red-500">فشل في تحميل وسائل الدفع</p>
      </div>
    );
  }

  const primaryMethod = methods.find(m => m.isDefault);
  const otherMethods = methods.filter(m => !m.isDefault);
  return (
    <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5">
      <PageHeader title="وسائل الدفع" />
      
      <div className="flex flex-col items-end gap-4 w-full">
        <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
          وسيلة الدفع الاساسية
        </h2>
        
        {/* Primary Payment Method */}
        {primaryMethod ? (
          <div className="flex p-3 flex-col items-center gap-1.5 w-full rounded-xl border border-[#F1F1F1] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
            <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
              <span className="flex-1 text-black text-right text-sm font-normal leading-[150%]">
                {primaryMethod.label}
              </span>
              <div className="flex px-2.5 py-1 justify-center items-center gap-1.5 rounded-full border border-[#198754] bg-[#A3CFBB]">
                <span className="text-white text-center text-sm font-normal leading-[150%]">
                  الاساسي
                </span>
              </div>
            </div>
            
            <div className="flex flex-row-reverse items-end gap-3 w-full">
              <div className="w-12 h-7 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                {getTypeLabel(primaryMethod.type)}
              </div>
              <span className="flex-1 text-black text-right text-sm font-normal leading-[150%]">
                {primaryMethod.lastFour ? `**** **** **** ${primaryMethod.lastFour}` : ''}{" "}
                {primaryMethod.expiryDate && (
                  <span className="text-[#C0C0C0]">الانتهاء {primaryMethod.expiryDate}</span>
                )}
              </span>
            </div>
            
            <div className="flex flex-row-reverse items-start gap-2 w-full">
              <button 
                onClick={() => handleDeleteMethod(primaryMethod.id)}
                disabled={deleteMethod.isPending}
                className="flex px-4 py-1.5 justify-center items-center gap-3 rounded-full border border-[#FD7E14] disabled:opacity-50"
              >
                <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                  حذف
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">لا توجد وسيلة دفع أساسية</div>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-4 w-full">
        <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
          وسائل الدفع المسجّلة
        </h2>
        
        {otherMethods.length === 0 ? (
          <div className="text-center text-gray-500 py-4 w-full">لا توجد وسائل دفع أخرى</div>
        ) : (
          otherMethods.map((method) => (
            <div key={method.id} className="flex p-3 flex-col items-center gap-1.5 w-full rounded-xl border border-[#F1F1F1] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
              <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
                <span className="flex-1 text-black text-right text-sm font-normal leading-[150%]">
                  {method.label}
                </span>
                <div className="flex justify-end items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" fill="#FD7E14"/>
                  </svg>
                  <span className="text-[#FD7E14] text-center text-sm font-normal leading-[150%]">
                    تعيين كادفع اساسي
                  </span>
                </div>
              </div>
              
              <div className="flex flex-row-reverse items-end gap-3 w-full">
                <div className="w-12 h-7 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {getTypeLabel(method.type)}
                </div>
                <span className="flex-1 text-black text-right text-sm font-normal leading-[150%]">
                  {method.lastFour ? `**** **** **** ${method.lastFour}` : ''}{" "}
                  {method.expiryDate && (
                    <span className="text-[#C0C0C0]">الانتهاء {method.expiryDate}</span>
                  )}
                </span>
              </div>
              
              <div className="flex flex-row-reverse items-start gap-2 w-full">
                <button 
                  onClick={() => handleDeleteMethod(method.id)}
                  disabled={deleteMethod.isPending}
                  className="flex px-4 py-1.5 justify-center items-center gap-3 rounded-full border border-[#FD7E14] disabled:opacity-50"
                >
                  <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                    حذف
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2.5 w-full">
        <button className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-[#FD7E14] w-full">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-white text-center text-base font-normal leading-[130%]">
            اضافة وسيلة دفع
          </span>
        </button>
      </div>
    </div>
  );
}
