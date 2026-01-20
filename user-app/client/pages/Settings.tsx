import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
import { useAuth } from "@/lib/auth";

export default function Settings() {
  const { customer } = useAuth();

  // Try to split contactName into first and last name
  const nameParts = (customer?.contactName || customer?.name || "").trim().split(" ");
  const firstName = nameParts[0] || "-";
  const lastName = nameParts.slice(1).join(" ") || "-";

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end bg-[#F8F9FA] p-5 pb-24">
        <div className="flex flex-col items-end gap-6 w-full">
          <PageHeader title="اعدادات الحساب" />
        
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
            بيانات الحساب
          </h2>
          
          <div className="flex flex-row-reverse justify-end items-start gap-2.5 w-full">
            {/* First Name */}
            <div className="flex flex-col items-end gap-1.5 flex-1">
              <span className="text-[#363636] text-base font-medium leading-[120%]">
                الاسم الأول
              </span>
              <div className="flex px-3 py-3 justify-end items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-[#F8F9FA]">
                <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                  {firstName}
                </span>
              </div>
            </div>
            
            {/* Last Name */}
            <div className="flex flex-col items-end gap-1.5 flex-1">
              <span className="text-[#363636] text-base font-medium leading-[120%]">
                الاسم الأخير
              </span>
              <div className="flex px-3 py-3 justify-end items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-[#F8F9FA]">
                <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                  {lastName}
                </span>
              </div>
            </div>
          </div>
          
          {/* Phone Number */}
          <div className="flex flex-col items-end gap-1.5 w-full">
            <span className="text-[#363636] text-base font-medium leading-[120%]">
              رقم الهاتف
            </span>
            <div className="flex px-3 py-3 justify-end items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-[#F8F9FA]">
              <span className="text-[#212529] text-right text-base font-normal leading-[130%]" dir="ltr">
                {customer?.phone || "-"}
              </span>
            </div>
          </div>

          {/* Business Name */}
          <div className="flex flex-col items-end gap-1.5 w-full">
            <span className="text-[#363636] text-base font-medium leading-[120%]">
              اسم النشاط التجاري
            </span>
            <div className="flex px-3 py-3 justify-end items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-[#F8F9FA]">
              <span className="text-[#212529] text-right text-base font-normal leading-[130%]">
                {customer?.businessNameAr || customer?.businessName || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
}
