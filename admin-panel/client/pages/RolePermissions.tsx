import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useSupervisor } from "../hooks/useSupervisors";

// Static permission definitions based on role type
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "رؤية بيانات العملاء",
    "رؤية و تعديل بيانات المنتجات",
    "رؤية بيانات قوائم الاسعار",
    "رؤية بيانات الطلبات",
    "رؤية و تعديل بيانات الخصومات و العروض الترويجية",
    "رؤية بيانات المدفوعات",
    "الوصول الي بيانات المستخدمين",
    "الوصول الي الحسابات و الصلاحيات",
  ],
  supervisor: [
    "رؤية بيانات العملاء",
    "رؤية بيانات المنتجات",
    "رؤية بيانات قوائم الاسعار",
    "رؤية بيانات الطلبات",
    "رؤية بيانات الخصومات و العروض الترويجية",
    "رؤية بيانات المدفوعات",
    "غير مصرح بالوصول الي بيانات المستخدمين",
    "غير مصرح بالوصول الي الحسابات و الصلاحيات",
  ],
  staff: [
    "رؤية بيانات العملاء المعينين",
    "رؤية بيانات المنتجات",
    "رؤية بيانات قوائم الاسعار",
    "رؤية بيانات الطلبات المعينة",
    "غير مصرح بالوصول الي بيانات الخصومات",
    "غير مصرح بالوصول الي بيانات المدفوعات",
    "غير مصرح بالوصول الي بيانات المستخدمين",
    "غير مصرح بالوصول الي الحسابات و الصلاحيات",
  ],
};

export default function RolePermissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch supervisor data from API
  const { data, isLoading, error } = useSupervisor(id);
  const supervisor = data?.data;
  
  // Get permissions based on supervisor's role (defaults to supervisor permissions)
  const permissions = ROLE_PERMISSIONS.supervisor;
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error || !supervisor) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">خطأ في تحميل بيانات المشرف</p>
          <button
            onClick={() => navigate("/supervisors")}
            className="text-primary hover:underline"
          >
            العودة للمشرفين
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="w-full flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex items-center gap-[60px] justify-between md:justify-start">
            {/* Title */}
            <h1 className="text-[32px] font-medium leading-[120%] text-primary order-2 md:order-1">
              بيانات الدور
            </h1>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-colors order-1 md:order-2"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Role Name Section */}
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium leading-[120%] text-newBlack text-right">
              اسم المشرف
            </label>
            <div className="text-base font-bold leading-[150%] text-bodyText text-right">
              {supervisor.nameAr || supervisor.name}
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-medium leading-[120%] text-secondary text-right">
              قائمة الصلاحيات
            </h2>

            {/* Permissions List */}
            <div className="flex flex-col gap-4">
              {permissions.map((permission, index) => (
                <div
                  key={index}
                  className="text-xl font-medium leading-[120%] text-bodyText text-right"
                >
                  • {permission}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
