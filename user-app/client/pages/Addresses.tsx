import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAddresses, useUpdateAddress, useDeleteAddress } from "@/hooks/useProfile";

export default function Addresses() {
  // Fetch addresses from API
  const { data: addressesData, isLoading, error } = useAddresses();
  const addresses = addressesData?.data || [];

  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const setPrimaryAddress = (id: string) => {
    // Find the address and update it as default
    const address = addresses.find(a => a.id === id);
    if (address) {
      // First unset all other defaults, then set this one
      updateAddress.mutate({
        ...address,
        isDefault: true,
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('هل تريد حذف هذا العنوان؟')) {
      deleteAddress.mutate(id);
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
        <p className="text-red-500">فشل في تحميل العناوين</p>
      </div>
    );
  }

  const primaryAddresses = addresses.filter(a => a.isDefault);
  const otherAddresses = addresses.filter(a => !a.isDefault);

  return (
    <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5">
      <PageHeader title="العناوين" />
      
      <div className="flex flex-col items-end gap-4 w-full">
        <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
          العنواين الأساسية
        </h2>
        
        {primaryAddresses.length === 0 ? (
          <div className="text-center text-gray-500 py-4">لا يوجد عنوان أساسي</div>
        ) : (
          primaryAddresses.map((address) => (
            <div key={address.id} className="flex p-4 flex-col justify-center items-end gap-6 w-full rounded-lg border border-[#D3D3D3] bg-white">
              <div className="flex flex-col items-end gap-3 w-full">
                <div className="flex flex-row-reverse items-center gap-1.5 w-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.1658 8.93977C11.6418 10.0015 10.9325 11.0601 10.2058 12.01C9.48132 12.957 8.75442 13.7768 8.20768 14.3605C8.13503 14.438 8.06566 14.5113 8 14.5801C7.93434 14.5113 7.86497 14.438 7.79232 14.3605C7.24558 13.7768 6.51868 12.957 5.79425 12.01C5.06754 11.0601 4.35825 10.0015 3.83423 8.93977C3.3048 7.86708 3 6.86191 3 6C3 3.23858 5.23858 1 8 1C10.7614 1 13 3.23858 13 6C13 6.86191 12.6952 7.86708 12.1658 8.93977ZM8 16C8 16 14 10.3137 14 6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6C2 10.3137 8 16 8 16Z" fill="#FD7E14"/>
                    <path d="M8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8ZM8 9C9.65685 9 11 7.65685 11 6C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6C5 7.65685 6.34315 9 8 9Z" fill="#FD7E14"/>
                  </svg>
                  <div className="flex flex-row-reverse justify-between items-center flex-1">
                    <div className="flex px-2.5 py-1 justify-center items-center gap-1.5 rounded-full border border-[#198754] bg-[#A3CFBB]">
                      <span className="text-white text-center text-sm font-normal leading-[150%]">
                        الاساسي
                      </span>
                    </div>
                    <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                      {address.label}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 w-full px-3">
                  <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                    {address.street}, {address.city}
                  </span>
                  {address.state && (
                    <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                      {address.state} {address.postalCode}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row-reverse items-start gap-2 w-full">
                <button 
                  onClick={() => handleDeleteAddress(address.id)}
                  disabled={deleteAddress.isPending}
                  className="flex px-4 py-1.5 justify-center items-center gap-3 rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] transition-colors disabled:opacity-50"
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
      
      <div className="flex flex-col items-end gap-4 w-full">
        <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
          عناوين أخرى
        </h2>
        
        {otherAddresses.map((address) => (
          <div key={address.id} className="flex p-4 flex-col justify-center items-end gap-6 w-full rounded-lg border border-[#D3D3D3] bg-white">
            <div className="flex flex-col items-end gap-3 w-full">
              <div className="flex flex-row-reverse items-center gap-4 w-full">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12.1658 8.93977C11.6418 10.0015 10.9325 11.0601 10.2058 12.01C9.48132 12.957 8.75442 13.7768 8.20768 14.3605C8.13503 14.438 8.06566 14.5113 8 14.5801C7.93434 14.5113 7.86497 14.438 7.79232 14.3605C7.24558 13.7768 6.51868 12.957 5.79425 12.01C5.06754 11.0601 4.35825 10.0015 3.83423 8.93977C3.3048 7.86708 3 6.86191 3 6C3 3.23858 5.23858 1 8 1C10.7614 1 13 3.23858 13 6C13 6.86191 12.6952 7.86708 12.1658 8.93977ZM8 16C8 16 14 10.3137 14 6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6C2 10.3137 8 16 8 16Z" fill="#FD7E14"/>
                  <path d="M8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 7.10457 9.10457 8 8 8ZM8 9C9.65685 9 11 7.65685 11 6C11 4.34315 9.65685 3 8 3C6.34315 3 5 4.34315 5 6C5 7.65685 6.34315 9 8 9Z" fill="#FD7E14"/>
                </svg>
                <div className="flex justify-end items-center flex-1">
                  <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                    {address.label}
                  </span>
                </div>
                <button 
                  onClick={() => setPrimaryAddress(address.id)} 
                  disabled={updateAddress.isPending}
                  className="flex justify-end items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="text-[#FD7E14] text-center text-sm font-normal leading-[150%]">
                    تعيين كاعنوان اساسي
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" fill="#FD7E14"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 w-full px-3">
                <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                  {address.street}, {address.city}
                </span>
                {address.state && (
                  <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] w-full">
                    {address.state} {address.postalCode}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-row-reverse items-start gap-2 w-full">
              <button 
                onClick={() => handleDeleteAddress(address.id)}
                disabled={deleteAddress.isPending}
                className="flex px-4 py-1.5 justify-center items-center gap-3 rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] transition-colors disabled:opacity-50"
              >
                <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                  حذف
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-end gap-2.5 w-full">
        <button className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors w-full">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-white text-center text-base font-normal leading-[130%]">
            اضافة عنوان جديد
          </span>
        </button>
      </div>
    </div>
  );
}
