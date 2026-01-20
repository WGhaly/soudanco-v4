import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
import { useAddresses, useAddAddress, useUpdateAddress } from "@/hooks/useProfile";

export default function Addresses() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'مصر',
    isDefault: true,
  });

  // Fetch addresses from API
  const { data: addressesData, isLoading, error } = useAddresses();
  const addresses = addressesData?.data || [];
  const existingAddress = addresses.length > 0 ? addresses[0] : null;

  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();

  // When existing address is loaded, populate form data
  useEffect(() => {
    if (existingAddress) {
      setFormData({
        id: existingAddress.id,
        label: existingAddress.label || '',
        addressLine1: existingAddress.addressLine1 || '',
        addressLine2: existingAddress.addressLine2 || '',
        city: existingAddress.city || '',
        region: existingAddress.region || '',
        postalCode: existingAddress.postalCode || '',
        country: existingAddress.country || 'مصر',
        isDefault: true,
      });
    }
  }, [existingAddress]);

  const handleOpenEditModal = () => {
    if (existingAddress) {
      setFormData({
        id: existingAddress.id,
        label: existingAddress.label || '',
        addressLine1: existingAddress.addressLine1 || '',
        addressLine2: existingAddress.addressLine2 || '',
        city: existingAddress.city || '',
        region: existingAddress.region || '',
        postalCode: existingAddress.postalCode || '',
        country: existingAddress.country || 'مصر',
        isDefault: true,
      });
    } else {
      setFormData({
        id: '',
        label: 'العنوان الرئيسي',
        addressLine1: '',
        addressLine2: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'مصر',
        isDefault: true,
      });
    }
    setShowEditModal(true);
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.addressLine1 || !formData.city) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    if (existingAddress) {
      // Update existing address
      updateAddress.mutate({
        id: existingAddress.id,
        label: formData.label || 'العنوان الرئيسي',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        region: formData.region,
        postalCode: formData.postalCode,
        country: formData.country,
        isDefault: true,
      }, {
        onSuccess: () => {
          setShowEditModal(false);
        },
      });
    } else {
      // Add new address
      addAddress.mutate({
        label: formData.label || 'العنوان الرئيسي',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        region: formData.region,
        postalCode: formData.postalCode,
        country: formData.country,
        isDefault: true,
      }, {
        onSuccess: () => {
          setShowEditModal(false);
        },
      });
    }
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
        <p className="text-red-500">فشل في تحميل العنوان</p>
      </div>
    );
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-24">
        <PageHeader title="العنوان" />
      
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
            عنوان التوصيل
          </h2>
          
          {existingAddress ? (
            <div className="flex p-4 flex-col justify-center items-end gap-6 w-full rounded-lg border border-[#D3D3D3] bg-white">
              <div className="flex flex-col items-end gap-3 w-full">
                <div className="flex items-center gap-1.5 w-full">
                  <div className="flex justify-between items-center flex-1">
                    <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                      {existingAddress.label || 'العنوان الرئيسي'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex px-2.5 py-1 justify-center items-center gap-1.5 rounded-full border border-[#198754] bg-[#A3CFBB]">
                        <span className="text-white text-center text-sm font-normal leading-[150%]">
                          الأساسي
                        </span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12.1658 8.93977C11.6418 10.0015 10.9325 11.0601 10.2058 12.01C9.48132 12.957 8.75442 13.7768 8.20768 14.3605C8.13503 14.438 8.06566 14.5113 8 14.5801C7.93434 14.5113 7.86497 14.438 7.79232 14.3605C7.24558 13.7768 6.51868 12.957 5.79425 12.01C5.06754 11.0601 4.35825 10.0015 3.83423 8.93977C3.3048 7.86708 3 6.86191 3 6C3 3.23858 5.23858 1 8 1C10.7614 1 13 3.23858 13 6C13 6.86191 12.6952 7.86708 12.1658 8.93977ZM8 16C8 16 14 10.3137 14 6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6C2 10.3137 8 16 8 16Z" fill="#FD7E14"/>
                        <path d="M8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8ZM8 9C9.65685 9 11 7.65685 11 6C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6C5 7.65685 6.34315 9 8 9Z" fill="#FD7E14"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 w-full px-3">
                  <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                    {existingAddress.addressLine1}
                    {existingAddress.addressLine2 && `, ${existingAddress.addressLine2}`}
                  </span>
                  <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                    {existingAddress.city}
                    {existingAddress.region && ` - ${existingAddress.region}`}
                    {existingAddress.postalCode && ` ${existingAddress.postalCode}`}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-row-reverse items-start gap-2 w-full">
                <button 
                  onClick={handleOpenEditModal}
                  className="flex px-4 py-1.5 justify-center items-center gap-3 rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] transition-colors"
                >
                  <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                    تعديل العنوان
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex p-6 flex-col items-center gap-4 w-full rounded-lg border border-dashed border-[#D3D3D3] bg-white">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
                <path d="M12.1658 8.93977C11.6418 10.0015 10.9325 11.0601 10.2058 12.01C9.48132 12.957 8.75442 13.7768 8.20768 14.3605C8.13503 14.438 8.06566 14.5113 8 14.5801C7.93434 14.5113 7.86497 14.438 7.79232 14.3605C7.24558 13.7768 6.51868 12.957 5.79425 12.01C5.06754 11.0601 4.35825 10.0015 3.83423 8.93977C3.3048 7.86708 3 6.86191 3 6C3 3.23858 5.23858 1 8 1C10.7614 1 13 3.23858 13 6C13 6.86191 12.6952 7.86708 12.1658 8.93977ZM8 16C8 16 14 10.3137 14 6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6C2 10.3137 8 16 8 16Z" fill="#D3D3D3"/>
                <path d="M8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8ZM8 9C9.65685 9 11 7.65685 11 6C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6C5 7.65685 6.34315 9 8 9Z" fill="#D3D3D3"/>
              </svg>
              <p className="text-[#6C757D] text-center text-base">لم تقم بإضافة عنوان بعد</p>
              <button 
                onClick={handleOpenEditModal}
                className="flex px-6 py-2.5 justify-center items-center gap-1.5 rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors"
              >
                <span className="text-white text-center text-base font-normal leading-[130%]">
                  إضافة عنوان
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Edit/Add Address Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-medium">
                  {existingAddress ? 'تعديل العنوان' : 'إضافة عنوان'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmitAddress} className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-right text-sm font-medium text-gray-700">اسم العنوان</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="مثال: المنزل، العمل"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-right text-sm font-medium text-gray-700">العنوان *</label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="الشارع، رقم المبنى"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-right text-sm font-medium text-gray-700">تفاصيل إضافية</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="رقم الشقة، الطابق (اختياري)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-right text-sm font-medium text-gray-700">المدينة *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="المدينة"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-right text-sm font-medium text-gray-700">الرمز البريدي</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="12345"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-right text-sm font-medium text-gray-700">المنطقة</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="المنطقة"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-[#FD7E14] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={addAddress.isPending || updateAddress.isPending}
                    className="flex-1 px-4 py-2.5 bg-[#FD7E14] text-white rounded-full hover:bg-[#E56D04] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(addAddress.isPending || updateAddress.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : existingAddress ? 'حفظ التغييرات' : 'إضافة العنوان'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
