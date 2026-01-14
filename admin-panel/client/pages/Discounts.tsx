import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DiscountsTable from "@/components/DiscountsTable";
import { useDiscounts, useUpdateDiscount } from "@/hooks/useDiscounts";
import { useToast } from "@/hooks/use-toast";

type DiscountFilter = "all" | "percentage" | "fixed" | "buy_get" | "spend_bonus";

export default function Discounts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<DiscountFilter>("all");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = useDiscounts(page, 10);
  const updateDiscount = useUpdateDiscount();

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDiscount.mutateAsync({
        id,
        isActive: !currentStatus
      });
      toast({
        title: "تم التحديث",
        description: currentStatus ? "تم إيقاف الخصم" : "تم تفعيل الخصم",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الخصم",
        variant: "destructive",
      });
    }
  };

  // Filter discounts
  const allDiscounts = data?.data ?? [];
  const filteredDiscounts = allDiscounts.filter((discount) => {
    const matchesSearch = 
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.nameAr?.includes(searchQuery));
    const matchesFilter = activeFilter === "all" || discount.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const pagination = data?.pagination;

  const filterOptions: { value: DiscountFilter; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "percentage", label: "نسبة مئوية" },
    { value: "fixed", label: "مبلغ ثابت" },
    { value: "buy_get", label: "اشتري واحصل" },
    { value: "spend_bonus", label: "أنفق واحصل" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="flex flex-col items-center flex-1 w-full">
          <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
            <div className="flex flex-col items-end gap-6 md:gap-8 self-stretch">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-4 self-stretch">
            {/* Title - Right */}
            <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">
              الخصومات
            </h1>

            {/* Search */}
            <div className="flex max-w-[720px] px-5 py-3 items-center gap-1 flex-1 rounded-[28px] bg-white border border-themeBorder">
              <div className="flex h-[30px] items-center gap-4 flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="عن ماذا تبحث؟"
                  className="flex-1 text-secondary text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                />
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate("/discounts/add")}
              className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <span className="text-white text-center text-base font-normal leading-[130%]">إضافة خصم</span>
              <Plus className="w-5 h-5 text-white" />
            </button>

            {/* Back Button - Left */}
            <button 
              onClick={() => navigate(-1)}
              className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setActiveFilter(option.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === option.value
                    ? "bg-brand-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Table Section */}
          <div className="flex flex-col items-end gap-6 self-stretch">
            <h2 className="text-2xl font-medium text-secondary text-right">جدول الخصومات</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-gray-secondary">جاري تحميل الخصومات...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-500 text-lg">حدث خطأ أثناء تحميل البيانات</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <DiscountsTable 
                discounts={filteredDiscounts}
                onToggleStatus={handleToggleStatus}
                pagination={pagination ? {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                  onPageChange: setPage,
                } : undefined}
              />
            )}
          </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
