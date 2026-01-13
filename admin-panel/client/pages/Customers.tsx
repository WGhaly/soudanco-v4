import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Plus, AlertCircle } from "lucide-react";
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
    <div className="flex min-h-screen bg-theme-background" dir="rtl">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mr-0 md:mr-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-body-text">العملاء</h1>
            
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="بحث عن عميل..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full md:w-64 pr-10 pl-4 py-2.5 border border-theme-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => navigate("/customers/new")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                <span>إضافة عميل</span>
                <Plus className="w-5 h-5" />
              </button>
            </div>
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
