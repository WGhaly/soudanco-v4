import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PriceListsTable from "@/components/PriceListsTable";
import { usePriceLists } from "@/hooks/usePriceLists";

export default function PriceLists() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = usePriceLists(page, limit);

  const priceLists = data?.data ?? [];
  const pagination = data?.pagination;

  // Filter by search (API may already filter, but we can also filter client-side for responsiveness)
  const filteredPriceLists = useMemo(() => {
    if (!searchQuery.trim()) return priceLists;
    const query = searchQuery.toLowerCase();
    return priceLists.filter(
      (pl) =>
        pl.name.toLowerCase().includes(query) ||
        (pl.nameAr && pl.nameAr.includes(query))
    );
  }, [priceLists, searchQuery]);

  const handleAddClick = () => {
    navigate('/price-lists/new');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertCircle className="w-12 h-12" />
            <p className="text-lg">حدث خطأ في تحميل قوائم الأسعار</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-body-text">قوائم الأسعار</h1>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-64 h-11 pr-10 pl-4 rounded-lg border border-[#D9D9D9] bg-white text-right text-body-text placeholder:text-secondary"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة قائمة</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <PriceListsTable
            priceLists={filteredPriceLists}
            pagination={
              pagination
                ? {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
