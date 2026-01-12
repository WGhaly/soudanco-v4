import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SupervisorsTable from "@/components/SupervisorsTable";
import { useSupervisors, useUpdateSupervisor } from "@/hooks/useSupervisors";
import { useToast } from "@/hooks/use-toast";

export default function Supervisors() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = useSupervisors(page, 10, {
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const updateSupervisor = useUpdateSupervisor();

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateSupervisor.mutateAsync({
        id,
        isActive: !currentStatus
      });
      toast({
        title: "تم التحديث",
        description: currentStatus ? "تم إيقاف المشرف" : "تم تفعيل المشرف",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المشرف",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilter = (value: "all" | "active" | "inactive") => {
    setStatusFilter(value);
    setPage(1);
  };

  const supervisors = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px]">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-4">
            {/* Title */}
            <h1 className="text-[2rem] font-medium text-primary flex-1 md:flex-initial text-right">
              المشرفين
            </h1>

            {/* Search */}
            <div className="relative flex-1 max-w-[720px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ابحث عن مشرف..."
                className="w-full px-5 py-3 pr-12 rounded-full bg-white border border-gray-200 text-base text-right outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate("/supervisors/new")}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مشرف</span>
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

          {/* Status Filter Tabs */}
          <div className="flex gap-2">
            {[
              { value: "all" as const, label: "الكل" },
              { value: "active" as const, label: "نشط" },
              { value: "inactive" as const, label: "غير نشط" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === option.value
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
            <h2 className="text-2xl font-medium text-secondary text-right">جدول المشرفين</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-gray-secondary">جاري تحميل المشرفين...</p>
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
              <SupervisorsTable 
                supervisors={supervisors}
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
      </main>
    </div>
  );
}
