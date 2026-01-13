import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-[60px]">
        <div className="w-full flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-4">
            {/* Title */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 md:flex-initial">
              الخصومات
            </h1>

            {/* Search */}
            <div className="relative flex-1 max-w-[720px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="عن ماذا تبحث؟"
                className="w-full px-5 py-3 pr-12 rounded-full bg-white border border-gray-200 text-base text-right outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate("/discounts/new")}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              <span>إضافة خصم</span>
              <Plus className="w-5 h-5" />
            </button>

            {/* Refresh Button */}
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex w-10 h-10 justify-center items-center rounded-full bg-gray-200 hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
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
          <div className="flex flex-col gap-6">
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
  );
}
