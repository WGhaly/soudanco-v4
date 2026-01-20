import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, ArrowLeft, ArrowRight, ChevronDown, Calendar, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useCreateDiscount, useDiscount, useUpdateDiscount } from "@/hooks/useDiscounts";

type DiscountType = "buy-get" | "spend-bonus" | null;

interface DiscountFormData {
  name: string;
  buyQuantity: string;
  getQuantity: string;
  spendAmount: string;
  bonusPercent: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function AddDiscount() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const { data: discountData, isLoading: discountLoading } = useDiscount(id);
  
  const [step, setStep] = useState<"select-type" | "fill-form">("select-type");
  const [selectedType, setSelectedType] = useState<DiscountType>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>({
    name: "",
    buyQuantity: "",
    getQuantity: "",
    spendAmount: "",
    bonusPercent: "",
    validFrom: "",
    validUntil: "",
    isActive: false,
  });
  
  // Load existing discount data in edit mode
  useEffect(() => {
    if (isEditMode && discountData?.data) {
      const discount = discountData.data;
      const type = discount.type === "buy_get" ? "buy-get" : "spend-bonus";
      setSelectedType(type);
      setStep("fill-form"); // Skip type selection in edit mode
      
      setFormData({
        name: discount.nameAr || discount.name || "",
        buyQuantity: discount.minQuantity?.toString() || "",
        getQuantity: discount.bonusQuantity?.toString() || discount.value?.toString() || "",
        spendAmount: discount.minOrderAmount?.toString() || "",
        bonusPercent: discount.type === "spend_bonus" ? discount.value?.toString() || "" : "",
        validFrom: discount.startDate ? discount.startDate.split('T')[0] : "",
        validUntil: discount.endDate ? discount.endDate.split('T')[0] : "",
        isActive: discount.isActive !== false,
      });
    }
  }, [isEditMode, discountData]);

  const handleTypeSelect = (type: DiscountType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      setStep("fill-form");
    }
  };

  const handleCancel = () => {
    navigate("/discounts");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("اسم الخصم مطلوب");
      return;
    }
    
    if (!formData.validFrom) {
      setError("تاريخ البداية مطلوب");
      return;
    }
    
    if (!formData.validUntil) {
      setError("تاريخ النهاية مطلوب");
      return;
    }
    
    if (formData.validFrom > formData.validUntil) {
      setError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }
    
    if (selectedType === "buy-get") {
      if (!formData.buyQuantity || parseInt(formData.buyQuantity) < 1) {
        setError("عدد الكراتين للشراء مطلوب");
        return;
      }
      if (!formData.getQuantity || parseInt(formData.getQuantity) < 1) {
        setError("عدد الكراتين المجانية مطلوب");
        return;
      }
    } else {
      if (!formData.spendAmount || parseFloat(formData.spendAmount) <= 0) {
        setError("الحد الأدنى للشراء مطلوب");
        return;
      }
      if (!formData.bonusPercent || parseFloat(formData.bonusPercent) <= 0 || parseFloat(formData.bonusPercent) > 100) {
        setError("نسبة الخصم يجب أن تكون بين 0 و 100");
        return;
      }
    }
    
    try {
      setError(null);
      const discountType = (selectedType === "buy-get" ? "buy_get" : "spend_bonus") as "fixed" | "percentage" | "buy_get" | "spend_bonus";
      const discountValue = selectedType === "buy-get" 
        ? parseInt(formData.getQuantity) || 1
        : parseFloat(formData.bonusPercent) || 0;
      
      const discountPayload = {
        name: formData.name,
        nameAr: formData.name,
        type: discountType,
        value: discountValue,
        minQuantity: selectedType === "buy-get" ? parseInt(formData.buyQuantity) || 1 : undefined,
        bonusQuantity: selectedType === "buy-get" ? parseInt(formData.getQuantity) || 1 : undefined,
        minOrderAmount: selectedType === "spend-bonus" ? parseFloat(formData.spendAmount) || undefined : undefined,
        startDate: formData.validFrom || new Date().toISOString(),
        endDate: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: formData.isActive,
      };
      
      if (isEditMode && id) {
        await updateDiscount.mutateAsync({ id, ...discountPayload });
      } else {
        await createDiscount.mutateAsync(discountPayload);
      }
      navigate("/discounts");
    } catch (err: any) {
      console.error(isEditMode ? "Error updating discount:" : "Error creating discount:", err);
      setError(err.message || (isEditMode ? "فشل في تحديث الخصم" : "فشل في إنشاء الخصم"));
    }
  };
  
  // Loading state for edit mode
  if (isEditMode && discountLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const updateField = (field: keyof DiscountFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Type Selection Screen
  if (step === "select-type") {
    return (
      <div className="flex min-h-screen bg-gray-50" dir="rtl">
        <Sidebar />
        
        <div className="flex-1 flex flex-col items-center p-6 md:p-10 lg:p-15">
          <div className="w-full max-w-[800px] flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-row items-center gap-4">
              {/* Page Title - Right */}
              <h1 className="text-[2rem] font-medium text-primary flex-1 text-right">
                اختار نوع الخصم
              </h1>
              
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedType}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-base">المتابعة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Back Button - Left */}
              <button
                onClick={handleCancel}
                className="flex w-10 h-10 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Type Selection Cards */}
            <div className="flex flex-col gap-1.5">
              {/* Buy X Get Y */}
              <button
                onClick={() => handleTypeSelect("buy-get")}
                className="flex items-center justify-end gap-2 w-full"
              >
                <div className="flex items-center justify-end gap-2.5 px-6 py-3 flex-1 rounded-md border border-green-600 bg-green-100 flex-row-reverse">
                  <span className="text-xl font-medium text-green-700">اشترِ x</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">احصل على Y</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  {selectedType === "buy-get" && (
                    <div className="w-3 h-3 rounded-full bg-gray-900" />
                  )}
                </div>
              </button>

              {/* Spend X Get Y% */}
              <button
                onClick={() => handleTypeSelect("spend-bonus")}
                className="flex items-center justify-end gap-1.5 w-full"
              >
                <div className="flex items-center justify-end gap-2.5 px-6 py-3 flex-1 rounded-md border border-green-600 bg-green-100 flex-row-reverse">
                  <span className="text-xl font-medium text-green-700">أنفق x</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">بونس Y%</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  {selectedType === "spend-bonus" && (
                    <div className="w-3 h-3 rounded-full bg-gray-900" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col items-center p-6 md:p-10 lg:p-15">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-row items-center gap-4">
            {/* Page Title - Right */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 text-right">
              اضافة خصم جديد
            </h1>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              <span className="text-base">إنشاء الخصم</span>
              <Check className="w-4 h-4" />
            </button>
            
            {/* Back Button - Left */}
            <button
              onClick={() => setStep("select-type")}
              className="flex w-10 h-10 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-end gap-2 px-4 py-3 rounded-lg bg-red-100 border border-red-300">
                <span className="text-red-700 text-base">{error}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#DC3545" strokeWidth="2"/>
                  <path d="M10 6V10M10 14H10.01" stroke="#DC3545" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}

            {/* Type Badge */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3 rounded-md border border-green-600 bg-green-100 flex-row-reverse">
              {selectedType === "buy-get" ? (
                <>
                  <span className="text-xl font-medium text-green-700">اشترِ x</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">احصل على Y</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-medium text-green-700">أنفق x</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">بونس Y%</span>
                </>
              )}
            </div>

            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium text-gray-900 text-right w-full">الاسم</label>
              <input
                type="text"
                placeholder="اسم العرض"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-3 py-3 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Type-specific fields */}
            {selectedType === "buy-get" ? (
              <div className="flex items-start gap-6">
                {/* Get Quantity */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-base font-medium text-gray-900 text-right w-full">احصل علي (كرتونة)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="1"
                      placeholder="عدد الكراتين"
                      value={formData.getQuantity}
                      onChange={(e) => updateField("getQuantity", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Buy Quantity */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-base font-medium text-gray-900 text-right w-full">اشترِ (كرتونة)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="1"
                      placeholder="عدد الكراتين"
                      value={formData.buyQuantity}
                      onChange={(e) => updateField("buyQuantity", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-6">
                {/* Bonus Percent */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-base font-medium text-gray-900 text-right w-full">نسبة الخصم (%)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="النسبة المئوية"
                      value={formData.bonusPercent}
                      onChange={(e) => updateField("bonusPercent", e.target.value)}
                      className="w-full px-3 py-3 pr-4 pl-10 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-gray-900">
                      %
                    </span>
                  </div>
                </div>

                {/* Spend Amount */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-base font-medium text-gray-900 text-right w-full">الحد الأدنى للشراء (جم)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="المبلغ"
                      value={formData.spendAmount}
                      onChange={(e) => updateField("spendAmount", e.target.value)}
                      className="w-full px-3 py-3 pr-4 pl-10 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-gray-900">
                      جم
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Valid Period */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-medium text-gray-900 text-right">الخصم صالح</h3>
              
              <div className="flex items-start gap-6">
                {/* Valid Until */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-base font-medium text-gray-900 text-right w-full">الي</label>
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={formData.validUntil}
                      min={formData.validFrom || new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateField("validUntil", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-base text-right focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Valid From */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-base font-medium text-gray-900 text-right w-full">من</label>
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={formData.validFrom}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        updateField("validFrom", e.target.value);
                        // Reset validUntil if it's before validFrom
                        if (formData.validUntil && e.target.value > formData.validUntil) {
                          updateField("validUntil", "");
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-300 bg-white text-base text-right focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activate Toggle */}
            <div className="flex items-center justify-end gap-3 h-14 rounded-full">
              <button
                onClick={() => updateField("isActive", !formData.isActive)}
                className="relative w-8 h-[17px] rounded-full border-2 border-primary transition-colors"
                style={{
                  backgroundColor: formData.isActive ? "transparent" : "transparent",
                }}
              >
                <div
                  className="absolute w-3.5 h-3.5 rounded-full top-[1px] transition-all"
                  style={{
                    right: formData.isActive ? "auto" : "1px",
                    left: formData.isActive ? "1px" : "auto",
                    backgroundColor: "#FD7E14",
                  }}
                />
              </button>
              <label className="text-base font-medium text-gray-900 flex-1 text-right">
                تفعيل العرض
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
