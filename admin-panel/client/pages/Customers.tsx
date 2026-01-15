import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Plus, AlertCircle, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import CustomersTable from "@/components/CustomersTable";
import { useCustomers, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // API hooks
  const { data, isLoading, error } = useCustomers({ 
    page, 
    limit: 10, 
    search: searchQuery || undefined 
  });
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Handle search with debounce reset to page 1
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Toggle customer active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateCustomer.mutateAsync({
        id,
        data: { isActive: !currentStatus }
      });
      toast({
        title: "تم التحديث",
        description: currentStatus ? "تم إيقاف الحساب" : "تم تفعيل الحساب",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الحساب",
        variant: "destructive",
      });
    }
  };

  // Delete customer
  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح",
      });
      setShowDeleteConfirm(null);
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive",
      });
    }
  };

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-[60px]">
        <div className="flex flex-col gap-6 md:gap-8 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-4 self-stretch">
            {/* Title - Right */}
            <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">العملاء</h1>
            
            {/* Search - Center */}
            <div className="flex max-w-[720px] px-5 py-3 items-center gap-1 flex-1 rounded-[28px] bg-white border border-themeBorder">
              <div className="flex h-[30px] items-center gap-4 flex-1">
                <input
                  type="text"
                  placeholder="عن ماذا تبحث؟"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 text-secondary text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                />
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate("/customers/new")}
              className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <span className="text-white text-center text-base font-normal leading-[130%]">إضافة عميل</span>
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

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
              <p className="text-gray-secondary">جاري تحميل العملاء...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-500 text-lg">حدث خطأ أثناء تحميل البيانات</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <CustomersTable
              customers={customers}
              onToggleStatus={handleToggleStatus}
              onDelete={(id) => setShowDeleteConfirm(id)}
              pagination={pagination ? {
                page: pagination.page,
                totalPages: pagination.totalPages,
                onPageChange: setPage,
              } : undefined}
            />
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-body-text mb-4 text-right">تأكيد الحذف</h3>
            <p className="text-gray-secondary mb-6 text-right">
              هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-theme-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteCustomer.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteCustomer.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
