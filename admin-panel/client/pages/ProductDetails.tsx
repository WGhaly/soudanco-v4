import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useProduct, useUpdateProduct, useDeleteProduct, useCategories } from "../hooks/useProducts";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch product data from API
  const { data: productData, isLoading, error } = useProduct(id || "");
  const { data: categoriesData } = useCategories();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Local state for editing
  const [productName, setProductName] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [productImage, setProductImage] = useState<string>("");

  // Sync local state with fetched data
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      setProductName(product.nameAr || product.name || "");
      setPackageSize(product.unit || "");
      setSku(product.sku || "");
      setCategory(product.category?.nameAr || product.category?.name || "");
      setIsAvailable(product.isActive ?? true);
      setProductImage(product.imageUrl || "");
    }
  }, [productData]);

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

  const handleSave = async () => {
    if (!id) return;
    
    try {
      await updateProductMutation.mutateAsync({
        id,
        data: {
          nameAr: productName,
          unit: packageSize,
          sku,
          isActive: isAvailable,
          imageUrl: productImage,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("فشل في تحديث المنتج");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteProductMutation.mutateAsync(id);
        navigate("/products");
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("فشل في حذف المنتج");
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="ltr">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex items-center justify-center">
          <div className="text-brand-primary text-xl">جاري التحميل...</div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !productData?.data) {
    return (
      <div className="flex min-h-screen bg-[#FFF]" dir="ltr">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-xl">حدث خطأ في تحميل المنتج</div>
          <Link
            to="/products"
            className="px-4 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90"
          >
            العودة إلى المنتجات
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="ltr">
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
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex mt-20 md:mt-0">
        <div className="flex flex-col items-end gap-8 self-stretch w-full">
          {/* Header */}
          <div className="flex flex-col items-end gap-8 self-stretch">
            <div className="flex flex-row items-center gap-4 self-stretch">
              {/* Title - Right */}
              <h1 className="flex-1 text-primary text-right text-[32px] font-medium leading-[120%]">
                مراجعة المنتج
              </h1>

              {/* Action Button */}
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:opacity-90 transition-colors"
                >
                  <span className="text-white text-center text-base font-normal leading-[130%]">
                    حفظ التعديلات
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4L6 11L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-primary hover:opacity-90 transition-colors"
                >
                  <span className="text-white text-center text-base font-normal leading-[130%]">
                    تعديل البيانات
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.33333 2.66667H2.66667C2.31304 2.66667 1.97391 2.80714 1.72386 3.05719C1.47381 3.30724 1.33333 3.64638 1.33333 4V13.3333C1.33333 13.687 1.47381 14.0261 1.72386 14.2761C1.97391 14.5262 2.31304 14.6667 2.66667 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V8.66667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.3333 1.66665C12.5985 1.40144 12.9582 1.25244 13.3333 1.25244C13.7085 1.25244 14.0681 1.40144 14.3333 1.66665C14.5985 1.93187 14.7475 2.29158 14.7475 2.66665C14.7475 3.04173 14.5985 3.40144 14.3333 3.66665L8 9.99999L5.33333 10.6667L6 7.99999L12.3333 1.66665Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Back Button - Left */}
              <button
                onClick={() => navigate(-1)}
                className="flex w-10 h-10 justify-center items-center rounded-full bg-primary hover:opacity-90 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col items-end gap-6 self-stretch">
              <div className="flex flex-col items-start gap-6 self-stretch">
                <h2 className="self-stretch text-theme-secondary text-right text-2xl font-medium leading-[120%]">
                  {productName}
                </h2>
              </div>
              <h3 className="self-stretch text-theme-secondary text-right text-2xl font-medium leading-[120%]">
                معلومات المنتج
              </h3>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col items-end gap-9 self-stretch">
            <div className="flex flex-col items-end gap-12 self-stretch">
              {/* Image and Actions */}
              <div className="flex justify-end items-end gap-6 self-stretch flex-col md:flex-row">
                {isEditing && (
                  <div className="flex w-full md:w-[284px] justify-end items-end gap-6">
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => handleImageUpload(e as any);
                        input.click();
                      }}
                      className="flex px-4 py-1.5 justify-center items-center gap-1.5 flex-1 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                    >
                      <span className="text-white text-center text-base font-normal leading-[130%]">
                        استبدال الصورة
                      </span>
                    </button>
                    <button
                      onClick={() => setProductImage("")}
                      className="flex px-4 py-1.5 justify-center items-center gap-1.5 flex-1 rounded-full border border-brand-primary hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-brand-primary text-center text-base font-normal leading-[130%]">
                        حذف الصورة
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex w-full md:w-[134px] h-[134px] p-2.5 items-center gap-2.5 rounded-xl border border-theme-border bg-white relative">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      لا توجد صورة
                    </div>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => handleImageUpload(e as any);
                        input.click();
                      }}
                      className="absolute left-2.5 bottom-2.75 flex p-2 justify-center items-center gap-1.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.33333 2.66667H2.66667C2.31304 2.66667 1.97391 2.80714 1.72386 3.05719C1.47381 3.30724 1.33333 3.64638 1.33333 4V13.3333C1.33333 13.687 1.47381 14.0261 1.72386 14.2761C1.97391 14.5262 2.31304 14.6667 2.66667 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2761C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V8.66667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.3333 1.66665C12.5985 1.40144 12.9582 1.25244 13.3333 1.25244C13.7085 1.25244 14.0681 1.40144 14.3333 1.66665C14.5985 1.93187 14.7475 2.29158 14.7475 2.66665C14.7475 3.04173 14.5985 3.40144 14.3333 3.66665L8 9.99999L5.33333 10.6667L6 7.99999L12.3333 1.66665Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col justify-center items-end gap-6 self-stretch">
                {/* Name and Size Row */}
                <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                  <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                    <div className="flex justify-end items-start gap-1 self-stretch">
                      <label className="text-new-black text-right text-base font-medium leading-[120%]">
                        حجم العبوة
                      </label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={packageSize}
                        onChange={(e) => setPackageSize(e.target.value)}
                        className="self-stretch px-3 py-3 text-body-text text-right text-base font-normal leading-[130%] rounded-full border border-theme-border outline-none"
                      />
                    ) : (
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {packageSize}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                    <div className="flex justify-end items-start gap-1 self-stretch">
                      <label className="text-new-black text-right text-base font-medium leading-[120%]">
                        الاسم
                      </label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="self-stretch px-3 py-3 text-body-text text-right text-base font-normal leading-[130%] rounded-full border border-theme-border outline-none"
                      />
                    ) : (
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {productName}
                      </div>
                    )}
                  </div>
                </div>

                {/* SKU and Category Row */}
                <div className="flex justify-end items-center gap-6 self-stretch flex-col md:flex-row">
                  <div className="flex flex-col items-start gap-3 flex-1 self-stretch rounded-full w-full">
                    <div className="flex justify-end items-start gap-1 self-stretch">
                      <label className="text-new-black text-base font-medium leading-[120%]">
                        الكود
                      </label>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="self-stretch px-3 py-3 text-body-text text-right text-base font-normal leading-[130%] rounded-full border border-theme-border outline-none"
                      />
                    ) : (
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {sku}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full">
                    <div className="flex justify-end items-start gap-1 self-stretch">
                      <label className="text-new-black text-right text-base font-medium leading-[120%]">
                        الصنف
                      </label>
                    </div>
                    {isEditing ? (
                      <div className="flex px-4 py-2.5 justify-end items-center gap-2.5 self-stretch rounded-full border border-white bg-white">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6L8 10L12 6" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="flex-1 text-body-text text-right text-base font-normal leading-[130%] outline-none bg-transparent cursor-pointer"
                        >
                          {categoriesData?.data?.map((cat) => (
                            <option key={cat.id} value={cat.nameAr || cat.name}>
                              {cat.nameAr || cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="self-stretch text-body-text text-right text-base font-bold leading-[150%]">
                        {category}
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Row */}
                {isEditing && (
                  <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                    <div className="flex px-0 py-4 justify-end items-end gap-3 flex-1 self-stretch w-full">
                      <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-8 h-[17px] relative rounded-full border-2 transition-colors ${
                          isAvailable ? "bg-brand-primary border-brand-primary" : "bg-gray-300 border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-[13px] h-[14px] rounded-full bg-white absolute top-[2px] transition-all ${
                            isAvailable ? "right-[17px]" : "right-[2px]"
                          }`}
                        ></div>
                      </button>
                      <div className="flex justify-end items-start gap-1">
                        <label className="text-new-black text-base font-medium leading-[120%]">
                          متاح
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 flex-1 self-stretch w-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
