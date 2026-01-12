import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AddProduct() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [sku, setSku] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [category, setCategory] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);

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

  const handleSubmit = () => {
    // Handle product creation
    console.log({
      productName,
      packageSize,
      sku,
      isAvailable,
      category,
      productImage,
    });
    navigate("/products");
  };

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
            <div className="flex justify-end items-center gap-[60px] self-stretch flex-col md:flex-row">
              {/* Buttons */}
              <div className="flex items-center gap-3 order-2 md:order-1">
                <Link
                  to="/products"
                  className="flex w-10 h-10 p-1.5 justify-center items-center gap-1.5 aspect-square rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 10H5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 5L5 10L10 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                <button
                  onClick={handleSubmit}
                  className="flex px-4 py-1.5 justify-center items-center gap-1.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4L6 11L3 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-white text-center text-base font-normal leading-[130%]">
                    إنشاء المنتج
                  </span>
                </button>
              </div>

              {/* Title */}
              <h1 className="flex-1 text-brand-primary text-right text-[32px] font-medium leading-[120%] order-1 md:order-2">
                إضافة المنتج
              </h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex flex-col items-end gap-6 self-stretch">
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
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] outline-none bg-transparent"
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
                  <div className="flex px-3 py-3 justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white">
                    <input
                      type="text"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      placeholder="1 لتر"
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                    />
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
                      placeholder="يُولّد تلقائياً إن تُرك فارغاً"
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Availability and Category */}
              <div className="flex items-center gap-6 self-stretch flex-col md:flex-row">
                <div className="flex px-0 py-3 justify-end items-end gap-3.5 flex-1 self-stretch w-full">
                  <div className="text-body-text text-right text-base font-medium leading-[120%]">
                    متاح
                  </div>
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
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] outline-none bg-transparent cursor-pointer"
                    >
                      <option value="">يرجي الاختيار</option>
                      <option value="juices">عصائر</option>
                      <option value="beverages">مشروبات</option>
                      <option value="fruits">فواكه</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
