import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Edit, Check, Loader2 } from "lucide-react";
import { useProducts, Product } from "../hooks/useProducts";
import { usePriceList, useCreatePriceList, useUpdatePriceList } from "../hooks/usePriceLists";

interface ProductPrice {
  id: string;
  name: string;
  code: string;
  size: string;
  price: string;
  image: string;
}

export default function AddPriceList() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Fetch products from API
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({ limit: 100 });
  
  // Fetch existing price list if editing
  const { data: priceListData, isLoading: priceListLoading } = usePriceList(id);
  
  // Mutations
  const createPriceList = useCreatePriceList();
  const updatePriceList = useUpdatePriceList();

  const [listName, setListName] = useState("");
  const [products, setProducts] = useState<ProductPrice[]>([]);
  
  // Initialize products from API data
  useEffect(() => {
    if (productsData?.data) {
      const mappedProducts: ProductPrice[] = productsData.data.map((p: Product) => ({
        id: p.id,
        name: p.nameAr || p.name,
        code: p.sku,
        size: p.unit || "",
        price: p.basePrice,
        image: p.imageUrl || "",
      }));
      setProducts(mappedProducts);
    }
  }, [productsData]);
  
  // Initialize price list name and override prices if editing
  useEffect(() => {
    if (isEditMode && priceListData?.data) {
      setListName(priceListData.data.nameAr || priceListData.data.name);
      
      // Override prices with price list item prices
      if (priceListData.data.items && products.length > 0) {
        const priceMap = new Map(priceListData.data.items.map(item => [item.productId, item.price]));
        setProducts(prev => prev.map(p => ({
          ...p,
          price: priceMap.get(p.id) || p.price,
        })));
      }
    }
  }, [isEditMode, priceListData, products.length]);

  const handlePriceChange = (productId: string, newPrice: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, price: newPrice } : product
      )
    );
  };

  const handleSave = async () => {
    if (!listName.trim()) {
      alert('يجب إدخال اسم القائمة');
      return;
    }

    const items = products.map(p => ({
      productId: p.id,
      price: p.price.replace(/,/g, ''), // Keep as string for server
    }));
    
    try {
      if (isEditMode && id) {
        await updatePriceList.mutateAsync({
          id,
          name: listName,
          nameAr: listName,
          items,
        });
      } else {
        await createPriceList.mutateAsync({
          name: listName,
          nameAr: listName,
          items,
        });
      }
      navigate("/price-lists");
    } catch (error) {
      console.error("Error saving price list:", error);
    }
  };
  
  // Loading state
  const isLoading = productsLoading || priceListLoading;
  const isSaving = createPriceList.isPending || updatePriceList.isPending;
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (productsError) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">خطأ في تحميل المنتجات</p>
          <button
            onClick={() => navigate("/price-lists")}
            className="text-primary hover:underline"
          >
            العودة للقوائم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar - First child for RTL layout */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium text-primary">
            {isEditMode ? "تعديل قائمة اسعار" : "اضافة قائمة اسعار"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col mt-16 lg:mt-0">
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-row items-center gap-4 mb-8">
            {/* Page Title - Right */}
            <h1 className="flex-1 text-3xl font-medium text-primary text-right">
              {isEditMode ? "تعديل قائمة اسعار" : "اضافة قائمة اسعار"}
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            </button>

            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* List Name Input */}
          <div className="mb-8 w-full max-w-sm ml-auto">
            <label className="block text-base font-medium text-gray-700 mb-2 text-right">
              اسم القائمة
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="اسم القائمة"
              className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-right placeholder:text-gray-400"
            />
          </div>

          {/* Products Table */}
          <div className="flex flex-col gap-6">
            {/* Desktop Table */}
            <div className="hidden md:flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center gap-8 px-4 py-3 bg-gray-200 rounded-t-lg">
                <div className="flex-1 text-sm text-secondary text-right">
                  صورة المنتج
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  اسم المنتج
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  كود المنتج
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  حجم العبوة
                </div>
                <div className="flex-1 text-sm text-secondary text-right">
                  السعر الحالي
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-8 px-4 py-4"
                  >
                    {/* Product Image */}
                    <div className="flex-1 flex justify-end">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-auto object-contain"
                      />
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 text-base text-gray-900 text-right">
                      {product.name}
                    </div>

                    {/* Product Code */}
                    <div className="flex-1 text-base text-gray-900 text-right underline">
                      {product.code}
                    </div>

                    {/* Size */}
                    <div className="flex-1 text-base font-bold text-gray-900 text-right">
                      {product.size}
                    </div>

                    {/* Price Input */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50">
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) =>
                            handlePriceChange(product.id, e.target.value)
                          }
                          className="flex-1 bg-transparent text-base text-gray-900 text-left focus:outline-none"
                        />
                        <span className="text-base text-gray-900">جم</span>
                        <Edit className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
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
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-auto object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">اسم المنتج</div>
                      <div className="text-base font-medium text-gray-900">
                        {product.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">كود المنتج</div>
                      <div className="text-base text-gray-900 underline">
                        {product.code}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">حجم العبوة</div>
                      <div className="text-base font-bold text-gray-900">
                        {product.size}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">السعر الحالي</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 bg-gray-50">
                      <Edit className="w-4 h-4 text-gray-900" />
                      <input
                        type="text"
                        value={product.price}
                        onChange={(e) =>
                          handlePriceChange(product.id, e.target.value)
                        }
                        className="flex-1 bg-transparent text-base font-bold text-gray-900 text-right focus:outline-none"
                      />
                      <span className="text-base font-bold text-gray-900">جم</span>
                    </div>
                  </div>
                </div>
              ))}

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
