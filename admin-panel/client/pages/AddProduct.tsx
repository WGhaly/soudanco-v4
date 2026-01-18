import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useCreateProduct, useCategories, useProduct, useUpdateProduct } from "../hooks/useProducts";
import { usePriceLists } from "../hooks/usePriceLists";

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: productData, isLoading: productLoading } = useProduct(id);
  const { data: categoriesData } = useCategories();
  const { data: priceListsData, isLoading: priceListsLoading } = usePriceLists(1, 100);
  const categories = categoriesData?.data || [];
  const priceLists = priceListsData?.data || [];
  
  const [productName, setProductName] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [sku, setSku] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceListPrices, setPriceListPrices] = useState<Record<string, string>>({});
  
  // Load existing product data in edit mode
  useEffect(() => {
    if (isEditMode && productData?.data) {
      const product = productData.data;
      setProductName(product.nameAr || product.name || "");
      setPackageSize(product.unit || "");
      setSku(product.sku || "");
      setBasePrice(product.basePrice?.toString() || "");
      setIsAvailable(product.isActive !== false);
      setCategoryId(product.categoryId || "");
      setProductImage(product.imageUrl || null);
      
      // Load price list prices if available
      if (product.priceListItems && Array.isArray(product.priceListItems)) {
        const prices: Record<string, string> = {};
        product.priceListItems.forEach((item: any) => {
          prices[item.priceListId] = item.price?.toString() || "";
        });
        setPriceListPrices(prices);
      }
    }
  }, [isEditMode, productData]);

  const handlePriceListPriceChange = (priceListId: string, value: string) => {
    setPriceListPrices(prev => ({
      ...prev,
      [priceListId]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      setError("اسم المنتج مطلوب");
      return;
    }
    if (!sku.trim()) {
      setError("كود المنتج مطلوب");
      return;
    }
    
    try {
      setError(null);
      
      // Build price list items array from prices entered
      const priceListItems = Object.entries(priceListPrices)
        .filter(([_, price]) => price && price.trim() !== "" && parseFloat(price) > 0)
        .map(([priceListId, price]) => ({
          priceListId,
          price: price.trim(),
        }));
      
      const productPayload: any = {
        name: productName,
        nameAr: productName,
        sku: sku,
        unit: packageSize || "case",
        basePrice: basePrice && basePrice.trim() !== "" ? basePrice : "0.00",
        isActive: isAvailable,
        priceListItems, // Include price list items
      };
      
      // Only add categoryId if a valid category was selected
      if (categoryId && categoryId.trim() !== "") {
        productPayload.categoryId = categoryId;
      }
      
      // Only add imageUrl if present
      if (productImage) {
        productPayload.imageUrl = productImage;
      }
      
      if (isEditMode && id) {
        await updateProduct.mutateAsync({ id, ...productPayload });
      } else {
        await createProduct.mutateAsync(productPayload);
      }
      navigate("/products");
    } catch (err: any) {
      console.error(isEditMode ? "Error updating product:" : "Error creating product:", err);
      setError(err.message || (isEditMode ? "فشل في تحديث المنتج" : "فشل في إنشاء المنتج"));
    }
  };
  
  // Loading state for edit mode
  if (isEditMode && productLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-brand-primary shadow-md">
        <button className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="text-white text-xl font-medium">سودانكو</span>
        <div className="w-6"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 flex-1 pt-20 md:pt-0">
        <div className="flex max-w-[800px] flex-col items-end gap-8 self-stretch px-4 md:px-0">
          {/* Header */}
          <div className="flex flex-col items-end gap-8 self-stretch">
            <div className="flex flex-row items-center gap-4 self-stretch">
              {/* Title - Right */}
              <h1 className="flex-1 text-primary text-right text-[32px] font-medium leading-[120%]">
                {isEditMode ? "تعديل المنتج" : "إضافة المنتج"}
              </h1>

              {/* Save Button */}
              <button
                onClick={handleSubmit}
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {(createProduct.isPending || updateProduct.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span className="text-white text-center text-base font-normal leading-[130%]">
                      {isEditMode ? "حفظ التعديلات" : "إنشاء المنتج"}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 4L6 11L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Back Button - Left */}
              <button
                onClick={() => navigate(-1)}
                className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:opacity-90 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex flex-col items-end gap-6 self-stretch">
            {/* Error Message */}
            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-right">
                {error}
              </div>
            )}
            
            {/* Image Upload Section */}
            <div className="flex justify-end items-start gap-6 self-stretch flex-col md:flex-row">
              <div className="flex w-full md:w-[134px] h-[134px] p-2.5 justify-center items-center gap-2.5 rounded-xl border border-theme-border bg-theme-border relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {productImage ? (
                  <img src={productImage} alt="Product preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 10V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 20H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
                <button className="absolute left-[51px] bottom-[51px] flex p-2 justify-center items-center gap-1.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33334V12.6667" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3.33331 8H12.6666" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col items-end gap-6 self-stretch">
              {/* Product Name */}
              <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black text-right text-base font-medium leading-[120%]">
                      الاسم
                    </label>
                  </div>
                  <div className="flex px-3 py-3 justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="اسم المنتج"
                      className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Package Size and SKU */}
              <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black text-right text-base font-medium leading-[120%]">
                      حجم العبوة
                    </label>
                  </div>
                  <div className="flex px-3 py-3 justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white relative">
                    <select
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">اختر الحجم</option>
                      <option value="1 لتر">1 لتر</option>
                      <option value="350 مل">350 مل</option>
                    </select>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-start gap-1.5 flex-1 self-stretch rounded-full w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black text-base font-medium leading-[120%]">
                      الكود (SKU)
                    </label>
                  </div>
                  <div className="flex px-4 py-3 justify-end items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                    <div className="flex w-4 h-4 flex-col justify-center items-center"></div>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="كود المنتج"
                      className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Availability and Category */}
              <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                {/* Base Price Field */}
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black text-right text-base font-medium leading-[120%]">
                      السعر الأساسي
                    </label>
                  </div>
                  <div className="flex px-3 py-3 justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent placeholder:text-gray-400"
                    />
                    <span className="text-gray-400">جم</span>
                  </div>
                </div>

                <div className="flex px-0 py-3 justify-end items-end gap-3.5 flex-1 self-stretch w-full">
                  <div className="text-body-text text-right text-base font-medium leading-[120%]">
                    متاح
                  </div>
                  <button
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-8 h-[17px] relative rounded-full border-2 transition-colors ${
                      isAvailable ? "bg-primary border-primary" : "bg-gray-300 border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-[13px] h-[14px] rounded-full bg-white absolute top-[2px] transition-all ${
                        isAvailable ? "right-[17px]" : "right-[2px]"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex flex-col items-start gap-1.5 flex-1 self-stretch rounded-full w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black text-base font-medium leading-[120%]">
                      الصنف
                    </label>
                  </div>
                  <div className="flex px-4 py-2.5 justify-end items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent cursor-pointer"
                    >
                      <option value="">يرجي الاختيار</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameAr || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Lists Section */}
              {priceLists.length > 0 && (
                <div className="flex flex-col items-end gap-4 self-stretch">
                  <div className="flex justify-end items-center gap-2 self-stretch border-t border-theme-border pt-6">
                    <h3 className="text-new-black text-right text-lg font-medium leading-[120%]">
                      أسعار قوائم الأسعار
                    </h3>
                  </div>
                  <p className="text-gray-500 text-right text-sm">
                    يمكنك تحديد سعر مختلف لهذا المنتج في كل قائمة أسعار. اتركه فارغاً لاستخدام السعر الأساسي.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 self-stretch">
                    {priceListsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      priceLists.map((priceList) => (
                        <div key={priceList.id} className="flex flex-col items-start gap-2 flex-1">
                          <div className="flex justify-end items-center gap-2 self-stretch">
                            <label className="text-new-black text-right text-sm font-medium leading-[120%]">
                              {priceList.nameAr || priceList.name}
                            </label>
                            {!priceList.isActive && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                غير نشط
                              </span>
                            )}
                          </div>
                          <div className="flex px-3 py-2.5 justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                            <input
                              type="number"
                              value={priceListPrices[priceList.id] || ""}
                              onChange={(e) => handlePriceListPriceChange(priceList.id, e.target.value)}
                              placeholder={basePrice || "0.00"}
                              step="0.01"
                              min="0"
                              className="flex-1 text-gray-900 text-right text-base font-normal leading-[130%] outline-none bg-transparent placeholder:text-gray-400"
                            />
                            <span className="text-gray-400">جم</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
