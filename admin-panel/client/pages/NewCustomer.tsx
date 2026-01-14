import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { usePriceLists } from "@/hooks/usePriceLists";
import { useSupervisors } from "@/hooks/useSupervisors";

export default function NewCustomer() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();
  
  // Fetch price lists and supervisors
  const { data: priceListsData, isLoading: priceListsLoading } = usePriceLists(1, 100);
  const { data: supervisorsData, isLoading: supervisorsLoading } = useSupervisors(1, 100);
  
  const priceLists = priceListsData?.data || [];
  const supervisors = supervisorsData?.data || [];
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessNameAr: "",
    contactName: "",
    phone: "",
    priceListId: "",
    supervisorId: "",
    creditLimit: "0",
    isActive: true,
    address: {
      label: "Main Office",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Saudi Arabia",
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = "البريد الإلكتروني مطلوب";
    if (!formData.password) newErrors.password = "كلمة المرور مطلوبة";
    if (!formData.businessName) newErrors.businessName = "اسم العمل مطلوب";
    if (!formData.contactName) newErrors.contactName = "اسم جهة الاتصال مطلوب";
    if (!formData.phone) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.address.addressLine1) newErrors.addressLine1 = "العنوان مطلوب";
    if (!formData.address.city) newErrors.city = "المدينة مطلوبة";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      await createCustomer.mutateAsync({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        businessNameAr: formData.businessNameAr,
        contactName: formData.contactName,
        phone: formData.phone,
        priceListId: formData.priceListId || undefined,
        supervisorId: formData.supervisorId || undefined,
        creditLimit: formData.creditLimit,
        address: formData.address,
      });
      
      navigate("/customers");
    } catch (error: any) {
      console.error("Error creating customer:", error);
      alert(error?.message || "فشل في إنشاء العميل");
    }
  };
  
  const isLoading = priceListsLoading || supervisorsLoading || createCustomer.isPending;
  
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center gap-4 mb-8">
            {/* Title - Right */}
            <h1 className="flex-1 text-3xl font-medium text-primary text-right">
              إضافة عميل جديد
            </h1>
            
            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>إنشاء العميل</span>
            </button>

            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:opacity-90"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Form */}
          <div className="bg-white rounded-lg p-6 space-y-6">
            {/* Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  اسم العمل *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="اسم العمل"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.businessName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  اسم العمل بالعربي
                </label>
                <input
                  type="text"
                  value={formData.businessNameAr}
                  onChange={(e) => handleChange("businessNameAr", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="اسم العمل بالعربي"
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  اسم جهة الاتصال *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleChange("contactName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="اسم جهة الاتصال"
                />
                {errors.contactName && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.contactName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="+966 XXX XXX XXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.phone}</p>
                )}
              </div>
            </div>
            
            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="كلمة المرور"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.password}</p>
                )}
              </div>
            </div>
            
            {/* Price List & Supervisor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  قائمة الأسعار
                </label>
                <select
                  value={formData.priceListId}
                  onChange={(e) => handleChange("priceListId", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  disabled={priceListsLoading}
                >
                  <option value="">اختر قائمة الأسعار</option>
                  {priceLists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.nameAr || pl.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  المشرف
                </label>
                <select
                  value={formData.supervisorId}
                  onChange={(e) => handleChange("supervisorId", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  disabled={supervisorsLoading}
                >
                  <option value="">اختر المشرف</option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.nameAr || sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Credit Limit & Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  الحد الائتماني
                </label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => handleChange("creditLimit", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  تفعيل الحساب
                </label>
                <label className="flex items-center justify-end gap-3 cursor-pointer">
                  <span className="text-gray-700">{formData.isActive ? "مفعل" : "غير مفعل"}</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-12 h-6 appearance-none bg-gray-300 rounded-full relative cursor-pointer transition-colors checked:bg-brand-primary"
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  />
                </label>
              </div>
            </div>
            
            {/* Address */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-right">العنوان</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      العنوان السطر 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address.addressLine1}
                      onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                      placeholder="الشارع، رقم المبنى"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-500 text-sm mt-1 text-right">{errors.addressLine1}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      العنوان السطر 2
                    </label>
                    <input
                      type="text"
                      value={formData.address.addressLine2}
                      onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                      placeholder="تفاصيل إضافية"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      المدينة *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                      placeholder="المدينة"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1 text-right">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      المنطقة
                    </label>
                    <input
                      type="text"
                      value={formData.address.region}
                      onChange={(e) => handleAddressChange("region", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                      placeholder="المنطقة"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      الرمز البريدي
                    </label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
