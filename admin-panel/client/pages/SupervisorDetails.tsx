import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Edit, RotateCcw, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useSupervisor } from "@/hooks/useSupervisors";

export default function SupervisorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch supervisor data from API
  const { data: supervisorData, isLoading, error } = useSupervisor(id);
  const supervisor = supervisorData?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <p className="text-red-500">فشل في تحميل بيانات المشرف</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="w-full flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-row items-center gap-4">
            {/* Title - Right */}
            <h1 className="flex-1 text-[32px] font-medium leading-[120%] text-primary text-right">
              بيانات المستخدم
            </h1>
            
            {/* Edit Data Button */}
            <button
              onClick={() => navigate(`/supervisors/${id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <span className="text-white text-base font-normal leading-[130%]">
                تعديل البيانات
              </span>
              <Edit className="w-4 h-4 text-white" />
            </button>

            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Customer Information Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-medium leading-[120%] text-secondary text-right">
              معلومات العميل
            </h2>

            {/* Name and Region */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Name */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  الاسم
                </label>
                <div className="text-base font-bold leading-[150%] text-bodyText text-right">
                  {supervisor.nameAr || supervisor.name}
                </div>
              </div>

              {/* Region */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  المنطقة
                </label>
                <div className="text-base font-bold leading-[150%] text-bodyText text-right">
                  {supervisor.region || 'غير محدد'}
                </div>
              </div>
            </div>

            {/* Phone and Role */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Role */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  دور المستخدم
                </label>
                <div className="text-base font-bold leading-[150%] text-bodyText text-right">
                  مشرف
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  رقم الهاتف
                </label>
                <div className="text-base font-normal leading-[130%] text-bodyText text-right">
                  {supervisor.phone}
                </div>
              </div>
            </div>

            {/* View Permissions Button */}
            <div>
              <button
                onClick={() => navigate(`/supervisors/${id}/permissions`)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-base font-normal leading-[130%]">
                  عرض الصلاحيات
                </span>
              </button>
            </div>
          </div>

          {/* Login Data Section */}
          <div className="flex flex-col gap-6">
            {/* Section Header with Toggle */}
            <div className="flex items-center gap-2.5">
              <h2 className="flex-1 text-2xl font-medium leading-[120%] text-secondary text-right">
                بيانات الدخول
              </h2>
              
              <div className="flex items-center gap-3">
                <label className="text-base font-medium leading-[120%] text-newBlack">
                  تفعيل الحساب
                </label>
                <button
                  className="relative w-8 h-[17px] rounded-full transition-colors"
                  style={{
                    backgroundColor: supervisor.isActive ? "#FD7E14" : "transparent",
                    border: supervisor.isActive ? "2px solid #FD7E14" : "2px solid #FD7E14",
                  }}
                >
                  <span
                    className="absolute top-[2px] w-[13px] h-[14px] rounded-full bg-white transition-all duration-200"
                    style={{
                      right: supervisor.isActive ? "2px" : "17px",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-3 max-w-[388px]">
              <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                البريد الالكتروني
              </label>
              <div className="text-base font-bold leading-[150%] text-bodyText text-right">
                {supervisor.user?.email || 'غير محدد'}
              </div>
            </div>

            {/* Reset Password Button */}
            <div>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors">
                <span className="text-white text-base font-normal leading-[130%]">
                  إعادة تعيين كلمة المرور
                </span>
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
