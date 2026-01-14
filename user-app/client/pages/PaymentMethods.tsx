import { useState } from "react";
import { Loader2, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { usePaymentMethods, useAddPaymentMethod, useDeletePaymentMethod, useSetDefaultPaymentMethod } from "@/hooks/useProfile";

export default function PaymentMethods() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit' as 'credit' | 'bank_transfer' | 'cash',
    label: '',
    cardNumber: '',
    cardholderName: '',
    lastFour: '',
    expiryDate: '',
    isDefault: false,
  });

  // Fetch payment methods from API
  const { data: methodsData, isLoading, error } = usePaymentMethods();
  const methods = methodsData?.data || [];
  
  const addMethod = useAddPaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  const setDefaultMethod = useSetDefaultPaymentMethod();

  const handleDeleteMethod = (id: string) => {
    if (confirm('هل تريد حذف وسيلة الدفع هذه؟')) {
      deleteMethod.mutate(id);
    }
  };

  const handleSetDefaultMethod = (id: string) => {
    setDefaultMethod.mutate(id);
  };

  const handleSubmitMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) {
      alert('يرجى إدخال اسم وسيلة الدفع');
      return;
    }
    addMethod.mutate(formData, {
      onSuccess: () => {
        setShowAddModal(false);
        setFormData({
          type: 'credit',
          label: '',
          cardNumber: '',
          cardholderName: '',
          lastFour: '',
          expiryDate: '',
          isDefault: false,
        });
      },
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit: 'بطاقة ائتمان',
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
                <button 
                  onClick={() => handleSetDefaultMethod(method.id)}
                  disabled={setDefaultMethod.isPending}
                  className="flex justify-end items-center gap-1.5 disabled:opacity-50 hover:opacity-80 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" fill="#FD7E14"/>
                  </svg>
                  <span className="text-[#FD7E14] text-center text-sm font-normal leading-[150%]">
                    تعيين كادفع اساسي
                  </span>
                </button>
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
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors w-full"
        >
          <span className="text-white text-center text-base font-normal leading-[130%]">
            اضافة وسيلة دفع
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-medium">إضافة وسيلة دفع جديدة</h2>
            </div>
            
            <form onSubmit={handleSubmitMethod} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-right text-sm font-medium text-gray-700">نوع وسيلة الدفع *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'bank_transfer' | 'cash' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                >
                  <option value="credit">بطاقة ائتمان</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="cash">نقدي</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-right text-sm font-medium text-gray-700">اسم وسيلة الدفع *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="مثال: بطاقة الراجحي"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                  required
                />
              </div>
              {formData.type === 'credit' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-right text-sm font-medium text-gray-700">رقم البطاقة *</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const lastFour = value.slice(-4);
                        setFormData({ ...formData, cardNumber: value, lastFour });
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">أدخل 16 رقم للبطاقة</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-right text-sm font-medium text-gray-700">اسم حامل البطاقة *</label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                      placeholder="الاسم كما يظهر على البطاقة"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-right text-sm font-medium text-gray-700">تاريخ الانتهاء *</label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setFormData({ ...formData, expiryDate: value });
                      }}
                      placeholder="12/25"
                      maxLength={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">صيغة: شهر/سنة</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 text-right">
                      ملاحظة: لن يتم تخزين CVV لأسباب أمنية. سيطلب منك إدخاله عند الدفع.
                    </p>
                  </div>
                </>
              )}
              <div className="flex items-center justify-end gap-2">
                <label className="text-sm text-gray-700">تعيين كوسيلة دفع أساسية</label>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#FD7E14] rounded focus:ring-[#FD7E14]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={addMethod.isPending}
                  className="flex-1 px-4 py-2.5 bg-[#FD7E14] text-white rounded-full hover:bg-[#E56D04] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addMethod.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
