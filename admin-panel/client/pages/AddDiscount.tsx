import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, ArrowLeft, ArrowRight, ChevronDown, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";

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
  const [step, setStep] = useState<"select-type" | "fill-form">("select-type");
  const [selectedType, setSelectedType] = useState<DiscountType>(null);
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

  const handleSave = () => {
    console.log("Saving discount:", { type: selectedType, ...formData });
    // Would save via API
    navigate("/discounts");
  };

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
            <div className="flex items-center justify-between gap-2.5">
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleContinue}
                  disabled={!selectedType}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-base">المتابعة</span>
                </button>
                
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors"
                >
                  <span className="text-base">الغاء العملية</span>
                </button>
              </div>
              
              {/* Page Title */}
              <h1 className="text-[2rem] font-medium text-primary flex-1 text-right">
                اختار نوع الخصم
              </h1>
            </div>

            {/* Type Selection Cards */}
            <div className="flex flex-col gap-1.5">
              {/* Buy X Get Y */}
              <button
                onClick={() => handleTypeSelect("buy-get")}
                className="flex items-center justify-end gap-2 w-full"
              >
                <div className="flex items-center gap-2.5 px-6 py-3 flex-1 rounded-md border border-green-600 bg-green-100">
                  <span className="text-xl font-medium text-green-700">احصل على Y</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">اشترِ x</span>
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
                <div className="flex items-center gap-2.5 px-6 py-3 flex-1 rounded-md border border-green-600 bg-green-100">
                  <span className="text-xl font-medium text-green-700">بونس Y%</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">أنفق x</span>
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
          <div className="flex items-center gap-2.5">
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span className="text-base">إنشاء الخصم</span>
              </button>
              
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors"
              >
                <span className="text-base">الغاء العملية</span>
              </button>
            </div>
            
            {/* Page Title */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 text-right">
              اضافة خصم جديد
            </h1>

            {/* Back Arrow */}
            <button onClick={() => setStep("select-type")}>
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-6">
            {/* Type Badge */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3 rounded-md border border-green-600 bg-green-100">
              {selectedType === "buy-get" ? (
                <>
                  <span className="text-xl font-medium text-green-700">احصل على Y</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">اشترِ x</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-medium text-green-700">بونس Y%</span>
                  <ArrowLeft className="w-5 h-5 text-green-700" />
                  <span className="text-xl font-medium text-green-700">أنفق x</span>
                </>
              )}
            </div>

            {/* Name Field */}
            <div className="flex flex-col gap-2 items-end">
              <label className="text-base font-medium text-gray-900">الاسم</label>
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
                <div className="flex-1 flex flex-col gap-2 items-end">
                  <label className="text-base font-medium text-gray-900">احصل علي</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="حدد العدد"
                      value={formData.getQuantity}
                      onChange={(e) => updateField("getQuantity", e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Buy Quantity */}
                <div className="flex-1 flex flex-col gap-2 items-end">
                  <label className="text-base font-medium text-gray-900">اشترِ</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="حدد العدد"
                      value={formData.buyQuantity}
                      onChange={(e) => updateField("buyQuantity", e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-6">
                {/* Bonus Percent */}
                <div className="flex-1 flex flex-col gap-2 items-end">
                  <label className="text-base font-medium text-gray-900">احصل علي (خصم)</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="الرصيد"
                      value={formData.bonusPercent}
                      onChange={(e) => updateField("bonusPercent", e.target.value)}
                      className="w-full px-3 py-3 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-gray-900">
                      %
                    </span>
                  </div>
                </div>

                {/* Spend Amount */}
                <div className="flex-1 flex flex-col gap-2 items-end">
                  <label className="text-base font-medium text-gray-900">أنفق</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="المبلغ"
                      value={formData.spendAmount}
                      onChange={(e) => updateField("spendAmount", e.target.value)}
                      className="w-full px-3 py-3 rounded-full border border-gray-300 bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
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
                <div className="flex-1 flex flex-col gap-1.5 items-end">
                  <label className="text-base font-medium text-gray-900">الي</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="يرجي اختيار التاريخ"
                      value={formData.validUntil}
                      onChange={(e) => updateField("validUntil", e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-white bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Valid From */}
                <div className="flex-1 flex flex-col gap-1.5 items-end">
                  <label className="text-base font-medium text-gray-900">من</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="يرجي اختيار التاريخ"
                      value={formData.validFrom}
                      onChange={(e) => updateField("validFrom", e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-full border border-white bg-white text-base text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
