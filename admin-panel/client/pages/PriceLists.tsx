import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, AlertCircle, ArrowRight } from "lucide-react";
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
    navigate('/price-lists/add');
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
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 lg:p-[60px]">
        <div className="flex flex-col gap-6 md:gap-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-4 self-stretch">
          {/* Title - Right */}
          <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1 md:flex-initial">قوائم الأسعار</h1>

          {/* Search - Center */}
          <div className="flex max-w-[720px] px-5 py-3 items-center gap-1 flex-1 rounded-[28px] bg-white border border-themeBorder">
            <div className="flex h-[30px] items-center gap-4 flex-1">
              <input
                type="text"
                placeholder="عن ماذا تبحث؟"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="flex-1 text-secondary text-right text-base font-normal leading-[130%] outline-none bg-transparent"
              />
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors"
          >
            <span className="text-white text-center text-base font-normal leading-[130%]">إضافة قائمة</span>
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
      </main>
    </div>
  );
}
