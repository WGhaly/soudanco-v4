import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Save, RotateCcw } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function EditSupervisor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  // Form state
  const [formData, setFormData] = useState({
    name: isNew ? "" : "اشرف صابر",
    region: isNew ? "" : "المنصورة",
    phone: isNew ? "" : "+201112345678",
    role: isNew ? "" : "مدير الحسابات",
    email: isNew ? "" : "ashrafsaber@88.com",
    isActive: true,
  });

  const handleSubmit = () => {
    // Handle form submission
    console.log("Form submitted:", formData);
    navigate(`/supervisors/${id}`);
  };

  const handleCancel = () => {
    if (isNew) {
      navigate("/supervisors");
    } else {
      navigate(`/supervisors/${id}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex justify-center">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-row items-center gap-4">
            {/* Title - Right */}
            <h1 className="flex-1 text-[32px] font-medium leading-[120%] text-primary text-right">
              بيانات المستخدم
            </h1>
            
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
            >
              <span className="text-base font-normal leading-[130%]">
                الغاء العملية
              </span>
            </button>

            {/* Save Changes Button */}
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <span className="text-white text-base font-normal leading-[130%]">
                حفظ التعديلات
              </span>
              <Save className="w-4 h-4 text-white" />
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
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[41px] px-3 rounded-full border border-themeBorder bg-white text-right text-base leading-[130%] text-secondary"
                  placeholder="اسم المستخدم"
                />
              </div>

              {/* Region */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  المنطقة
                </label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full h-[41px] px-4 pr-4 pl-10 rounded-full border border-themeBorder bg-white text-right text-base leading-[130%] text-secondary appearance-none cursor-pointer"
                  >
                    <option value="">اختر المنطقة</option>
                    <option value="المنصورة">المنصورة</option>
                    <option value="القاهرة">القاهرة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                  </select>
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-[13px] h-[7px] pointer-events-none"
                    viewBox="0 0 13 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L6.5 6L12 1"
                      stroke="#ADB5BD"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role and Phone */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Role */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  دور المستخدم
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-[41px] px-4 pr-4 pl-10 rounded-full border border-themeBorder bg-white text-right text-base leading-[130%] text-secondary appearance-none cursor-pointer"
                  >
                    <option value="">اختر الدور</option>
                    <option value="المسؤول العام">المسؤول العام</option>
                    <option value="مدير الحسابات">مدير الحسابات</option>
                    <option value="موظف">موظف</option>
                  </select>
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-[13px] h-[7px] pointer-events-none"
                    viewBox="0 0 13 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L6.5 6L12 1"
                      stroke="#ADB5BD"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-[41px] px-4 rounded-full border border-themeBorder bg-white text-right text-base leading-[130%] text-secondary"
                  placeholder="+201112345678"
                />
              </div>
            </div>

            {/* View Permissions Button (Disabled in edit mode) */}
            <div>
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#FECBA1] text-[#FECBA1] cursor-not-allowed opacity-60"
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
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="relative w-8 h-[17px] rounded-full transition-colors"
                  style={{
                    backgroundColor: formData.isActive ? "#FD7E14" : "transparent",
                    border: formData.isActive ? "2px solid #FD7E14" : "2px solid #FD7E14",
                  }}
                >
                  <span
                    className="absolute top-[2px] w-[13px] h-[14px] rounded-full bg-white transition-all duration-200"
                    style={{
                      right: formData.isActive ? "2px" : "17px",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 max-w-[388px]">
              <label className="text-base font-medium leading-[120%] text-newBlack text-right">
                البريد الالكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-[41px] px-3 rounded-full border border-themeBorder bg-white text-right text-base leading-[130%] text-secondary"
                placeholder="email@example.com"
              />
            </div>

            {/* Reset Password Button (Disabled in edit mode) */}
            <div>
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FECBA1] cursor-not-allowed opacity-60"
              >
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
