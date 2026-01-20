import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import PullToRefresh from "@/components/PullToRefresh";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useProducts({
    search: searchQuery || undefined,
    category: category || undefined,
    status: productStatus || undefined,
    page,
    limit: 20,
  });
  
  const { data: categoriesData } = useCategories();
  const { data: cartData } = useCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const pagination = productsData?.pagination;
  const cartItems = cartData?.data?.items || [];

  // Helper to get cart info for a product
  const getCartInfo = (productId: string) => {
    const cartItem = cartItems.find(item => item.productId === productId && !item.isFreeItem);
    return {
      quantity: cartItem?.quantity || 0,
      itemId: cartItem?.id,
    };
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          toast({
            title: "تمت الإضافة",
            description: "تم إضافة المنتج إلى السلة",
          });
        },
        onError: (error) => {
          toast({
            title: "خطأ",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateCartItem.mutate(
      { itemId, quantity: newQuantity },
      {
        onError: (error) => {
          toast({
            title: "خطأ",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeCartItem.mutate(itemId, {
      onError: (error) => {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const defaultImage = "https://api.builder.io/api/v1/image/assets/TEMP/86501bd89bfb43fe0882378e0ea38736bf4ebf29";

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-24">
        <PageHeader title="المنتجات" showCart={true} />
      
      <div className="flex flex-col items-end gap-6 w-full">
        {/* Search Bar */}
        <div className="flex flex-row-reverse max-w-[720px] px-5 py-1.5 items-center gap-1 w-full rounded-[28px] bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
          <div className="flex h-[30px] items-center gap-4 flex-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L11.1 11.1" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="عن ماذا تبحث؟"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 text-right text-base font-normal leading-[130%] placeholder-[#ADB5BD] bg-transparent border-none outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-row-reverse justify-end items-center gap-2.5 w-full">
          <div className="flex flex-col items-end gap-1.5 flex-1 rounded-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
              حالة المنتج
            </label>
            <select
              value={productStatus}
              onChange={(e) => {
                setProductStatus(e.target.value);
                setPage(1);
              }}
              className="flex px-6 py-2.5 justify-center items-center gap-2.5 w-full rounded-full border border-white bg-white text-[#ADB5BD] text-right text-sm font-normal leading-[150%] cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23ADB5BD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 12px center',
              }}
            >
              <option value="">الكل</option>
              <option value="in_stock">متوفر</option>
              <option value="out_of_stock">غير متوفر</option>
            </select>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 flex-1 rounded-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
              التصنيف
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="flex px-6 py-2.5 justify-center items-center gap-2.5 w-full rounded-full border border-white bg-white text-[#ADB5BD] text-right text-sm font-normal leading-[150%] cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23ADB5BD' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 12px center',
              }}
            >
              <option value="">كل التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr || cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FD7E14]"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 w-full">
              {products.length > 0 ? (
                products.map((product, idx) => {
                  const cartInfo = getCartInfo(product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      productId={product.id}
                      image={product.imageUrl || defaultImage}
                      title={product.nameAr || product.name}
                      subtitle={`${product.unitsPerCase} ${product.unit}`}
                      price={`${product.price} جم / ${product.unit}`}
                      cartQuantity={cartInfo.quantity}
                      cartItemId={cartInfo.itemId}
                      onAddToCart={(quantity) => handleAddToCart(product.id, quantity)}
                      onUpdateQuantity={cartInfo.itemId ? (itemId, qty) => handleUpdateQuantity(itemId, qty) : undefined}
                      onRemoveFromCart={cartInfo.itemId ? (itemId) => handleRemoveFromCart(itemId) : undefined}
                      outOfStock={product.stockStatus === 'out_of_stock'}
                      highlightOutOfStock={idx === 0 && product.stockStatus === 'out_of_stock'}
                    />
                  );
                })
              ) : (
                <div className="col-span-2 flex items-center justify-center py-8">
                  <p className="text-[#ADB5BD] text-center text-base font-normal">
                    لم يتم العثور على منتجات
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-row-reverse justify-center items-center gap-2 w-full mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-full bg-white border border-[#DEE2E6] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                >
                  السابق
                </button>
                <span className="text-sm text-[#6C757D]">
                  صفحة {page} من {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 rounded-full bg-white border border-[#DEE2E6] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
      </div>
    </PullToRefresh>
  );
}
