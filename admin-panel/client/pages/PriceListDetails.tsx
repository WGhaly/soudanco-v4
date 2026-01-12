import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { usePriceList } from "@/hooks/usePriceLists";

export default function PriceListDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch price list data from API
  const { data: priceListData, isLoading, error } = usePriceList(id);
  const priceList = priceListData?.data;
  const items = priceList?.items || [];

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('ar-EG')} جم`;
  };

  const handleEdit = () => {
    navigate(`/price-lists/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !priceList) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <p className="text-red-500">فشل في تحميل قائمة الأسعار</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 right-0 left-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium text-primary">قائمة الاسعار</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:mr-64 mt-16 lg:mt-0">
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/price-lists")}
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>تعديل البيانات</span>
              </button>
            </div>

            {/* Page Title */}
            <h1 className="flex-1 text-3xl font-medium text-primary text-right">
              قائمة الاسعار
            </h1>
          </div>

          {/* Price List Name */}
          <div className="flex items-center justify-end gap-2 mb-8">
            <h2 className="text-2xl font-medium text-secondary">
              {priceList.nameAr || priceList.name}
            </h2>
          </div>

          {/* Category Dropdown */}
          <div className="mb-8 w-full max-w-sm ml-auto">
            <label className="block text-base font-medium text-gray-700 mb-2 text-right">
              الصنف
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 pr-4 pl-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-right appearance-none bg-white text-gray-400"
              >
                <option value="">يرجي الاختيار</option>
                <option value="juices">عصائر</option>
                <option value="snacks">وجبات خفيفة</option>
              </select>
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Products Table */}
          <div className="flex flex-col gap-6">
            {/* Desktop Table */}
            <div className="hidden md:flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center gap-8 px-4 py-3 bg-gray-200 rounded-t-lg">
                <div className="flex-1 text-sm text-secondary text-right">
                  السعر الحالي
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  حجم العبوة
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  كود المنتج
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  اسم المنتج
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  صورة المنتج
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">لا توجد منتجات في هذه القائمة</div>
                ) : (
                  items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-8 px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Price */}
                      <div className="flex-1 text-base font-bold text-gray-900 text-right">
                        {formatCurrency(item.price)}
                      </div>

                      {/* Size/Unit */}
                      <div className="flex-1 text-base font-bold text-gray-900 text-right">
                        -
                      </div>

                      {/* Product Code */}
                      <div className="flex-1 text-base text-gray-900 text-right underline">
                        {item.productSku || '-'}
                      </div>

                      {/* Product Name */}
                      <div className="flex-1 text-base text-gray-900 text-right">
                        {item.productName || '-'}
                      </div>

                      {/* Product Image */}
                      <div className="flex-1 flex justify-end">
                        <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          صورة
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1 py-4 border-t border-gray-200">
                <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  1
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-primary font-bold">
                  2
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  3
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  4
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  5
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="2" cy="8" r="2" />
                    <circle cx="8" cy="8" r="2" />
                    <circle cx="14" cy="8" r="2" />
                  </svg>
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  10
                </button>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="flex md:hidden flex-col gap-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">لا توجد منتجات في هذه القائمة</div>
              ) : (
                items.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        صورة
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">اسم المنتج</div>
                        <div className="text-base font-medium text-gray-900">
                          {item.productName || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">كود المنتج</div>
                        <div className="text-base text-gray-900 underline">
                          {item.productSku || '-'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">حجم العبوة</div>
                        <div className="text-base font-bold text-gray-900">
                          -
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">السعر الحالي</div>
                      <div className="text-base font-bold text-gray-900">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Mobile Pagination */}
              <div className="flex items-center justify-center gap-2 py-4">
                <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  1
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-primary font-bold">
                  2
                </button>
                <button className="w-11 h-11 flex items-center justify-center text-gray-900 font-bold">
                  3
                </button>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
