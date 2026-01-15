import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Search, Plus, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProductsTable from "@/components/ProductsTable";
import { useProducts, useCategories } from "@/hooks/useProducts";

export default function Products() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  // API hooks
  const { data, isLoading, error, refetch, isFetching } = useProducts({ 
    page, 
    limit: 10, 
    search: searchQuery || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: categoriesData } = useCategories();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const categories = categoriesData?.data ?? [];

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px]">
        <div className="flex w-full flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col items-end gap-8 self-stretch">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 self-stretch">
              {/* Page Title - Right */}
              <h1 className="text-primary text-right text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">
                المنتجات
              </h1>

              {/* Search Bar - Center */}
              <div className="flex max-w-[720px] px-5 py-3 items-center gap-1 flex-1 rounded-[28px] bg-white border border-themeBorder">
                <div className="flex h-[30px] items-center gap-4 flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="عن ماذا تبحث؟"
                    className="flex-1 text-secondary text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                  />
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Add Button */}
              <Link
                to="/products/new"
                className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
              >
                <span className="text-white text-center text-base font-normal leading-[130%]">
                  اضافة منتج
                </span>
                <Plus className="w-5 h-5 text-white" />
              </Link>

              {/* Back Button - Left */}
              <button
                onClick={() => navigate(-1)}
                className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row-reverse items-end gap-2.5 self-stretch justify-start">
              {/* Status Filter */}
              <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
                <label className="text-base font-medium text-gray-900 text-right">
                  حالة المنتج
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">الكل</option>
                    <option value="in_stock">متوفر</option>
                    <option value="low_stock">مخزون منخفض</option>
                    <option value="out_of_stock">غير متوفر</option>
                  </select>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1 flex flex-col gap-1.5 w-full md:w-auto">
                <label className="text-base font-medium text-gray-900 text-right">
                  الصنف
                </label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 bg-white text-sm text-right text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">الكل</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr || cat.name}
                      </option>
                    ))}
                  </select>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex flex-col items-end gap-6 self-stretch">
            <h2 className="self-stretch text-secondary text-right text-2xl font-medium leading-[120%]">
              جدول المنتجات
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-gray-secondary">جاري تحميل المنتجات...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
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
              <ProductsTable 
                products={products} 
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
