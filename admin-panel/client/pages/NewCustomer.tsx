import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useCreateCustomer, useCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { usePriceLists } from "@/hooks/usePriceLists";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function NewCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const { data: customerData, isLoading: customerLoading } = useCustomer(id);
  
  // Fetch price lists
  const { data: priceListsData, isLoading: priceListsLoading } = usePriceLists(1, 100);
  
  // Fetch reward categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['reward-categories'],
    queryFn: () => fetchWithAuth('/api/reward-tiers/categories'),
  });
  
  const priceLists = priceListsData?.data || [];
  const rewardCategories = categoriesData?.data || [];
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessNameAr: "",
    contactName: "",
    phone: "",
    priceListId: "",
    rewardCategory: "",
    creditLimit: "0",
    isActive: true,
    address: {
      label: "Main Office",
      addressLine1: "",
      addressLine2: "" as string | undefined,
      city: "",
      region: "" as string | undefined,
      postalCode: "" as string | undefined,
      country: "Egypt",
    },
  });
  
  // Load existing customer data in edit mode
  useEffect(() => {
    if (isEditMode && customerData?.data) {
      const customer = customerData.data;
      const existingAddress = customer.addresses?.[0];
      setFormData({
        email: customer.email || "",
        password: "", // Don't show password
        businessName: customer.businessName || "",
        businessNameAr: customer.businessNameAr || "",
        contactName: customer.contactName || "",
        phone: customer.phone || "",
        priceListId: customer.priceListId || "",
        rewardCategory: customer.rewardCategory || "",
        creditLimit: customer.creditLimit?.toString() || "0",
        isActive: customer.isActive !== false,
        address: {
          label: existingAddress?.label || "Main Office",
          addressLine1: existingAddress?.addressLine1 || "",
          addressLine2: existingAddress?.addressLine2,
          city: existingAddress?.city || "",
          region: existingAddress?.region,
          postalCode: existingAddress?.postalCode,
          country: existingAddress?.country || "Saudi Arabia",
        },
      });
    }
  }, [isEditMode, customerData]);
  
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
    // Password is only required for new customers
    if (!isEditMode && !formData.password) newErrors.password = "كلمة المرور مطلوبة";
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
      const customerPayload: any = {
        email: formData.email,
        businessName: formData.businessName,
        businessNameAr: formData.businessNameAr,
        contactName: formData.contactName,
        phone: formData.phone,
        priceListId: formData.priceListId || undefined,
        creditLimit: formData.creditLimit,
        isActive: formData.isActive,
        address: formData.address,
      };
      
      // Only include password for new customers or if changed
      if (formData.password) {
        customerPayload.password = formData.password;
      }
      
      if (isEditMode && id) {
        await updateCustomer.mutateAsync({ id, data: customerPayload });
      } else {
        await createCustomer.mutateAsync(customerPayload);
      }
      
      navigate("/customers");
    } catch (error: any) {
      console.error(isEditMode ? "Error updating customer:" : "Error creating customer:", error);
      alert(error?.message || (isEditMode ? "فشل في تحديث العميل" : "فشل في إنشاء العميل"));
    }
  };
  
  const isLoading = priceListsLoading || createCustomer.isPending || updateCustomer.isPending;
  
  // Loading state for edit mode
  if (isEditMode && customerLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-row items-center gap-4 mb-8">
            {/* Title - Right */}
            <h1 className="flex-1 text-3xl font-medium text-primary text-right">
              {isEditMode ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
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
              <span>{isEditMode ? "حفظ التعديلات" : "إنشاء العميل"}</span>
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
                  placeholder="+20 XXX XXX XXXX"
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
                  البريد الإلكتروني {!isEditMode && '*'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isEditMode}
                  className={`w-full px-4 py-2 rounded-lg border border-gray-300 text-right ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="email@example.com"
                />
                {isEditMode && (
                  <p className="text-gray-500 text-xs mt-1 text-right">لا يمكن تعديل البريد الإلكتروني</p>
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.email}</p>
                )}
              </div>
              
              {!isEditMode && (
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
              )}
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
                  فئة المكافآت
                </label>
                <select
                  value={formData.rewardCategory}
                  onChange={(e) => handleChange("rewardCategory", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-right"
                  disabled={categoriesLoading}
                >
                  <option value="">بدون فئة</option>
                  {rewardCategories.map((category: any) => (
                    <option key={category.name} value={category.name}>
                      {category.nameAr || category.name}
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
                  step="1"
                  value={formData.creditLimit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      handleChange("creditLimit", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
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
