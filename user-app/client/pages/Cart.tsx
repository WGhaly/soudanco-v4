import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import PullToRefresh from "@/components/PullToRefresh";
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart, useAddToCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

interface BuyGetSelection {
  discountId: string;
  discountName: string;
  freeItemsCount: number;
  eligibleProductIds: string[] | null;
}

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cartData, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const addToCart = useAddToCart();
  const { data: productsData } = useProducts({ limit: 100 });
  
  const [buyGetModal, setBuyGetModal] = useState<BuyGetSelection | null>(null);
  const [selectedFreeProducts, setSelectedFreeProducts] = useState<Record<string, number>>({});

  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const allProducts = productsData?.data || [];

  // Get buy_get discounts that need product selection
  const buyGetDiscounts = cart?.appliedDiscounts?.filter((d: any) => d.type === 'buy_get' && d.freeItemsCount > 0) || [];

  const handleSelectFreeProducts = (discount: any) => {
    setBuyGetModal({
      discountId: discount.id,
      discountName: discount.nameAr || discount.name,
      freeItemsCount: discount.freeItemsCount,
      eligibleProductIds: discount.eligibleProductIds,
    });
    setSelectedFreeProducts({});
  };

  const getEligibleProducts = () => {
    if (!buyGetModal) return [];
    if (buyGetModal.eligibleProductIds && buyGetModal.eligibleProductIds.length > 0) {
      return allProducts.filter(p => buyGetModal.eligibleProductIds!.includes(p.id));
    }
    return allProducts;
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedFreeProducts).reduce((sum, count) => sum + count, 0);
  };

  const handleProductSelect = (productId: string, delta: number) => {
    const currentCount = selectedFreeProducts[productId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    const totalWithChange = getTotalSelectedCount() - currentCount + newCount;
    
    if (buyGetModal && totalWithChange > buyGetModal.freeItemsCount) {
      toast({
        title: "تنبيه",
        description: `يمكنك اختيار ${buyGetModal.freeItemsCount} منتجات مجانية فقط`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFreeProducts(prev => ({
      ...prev,
      [productId]: newCount,
    }));
  };

  const handleConfirmFreeProducts = async () => {
    if (!buyGetModal) return;
    
    // Add selected free products to cart as bonus items (with discount tracking)
    for (const [productId, quantity] of Object.entries(selectedFreeProducts)) {
      if (quantity > 0) {
        await addToCart.mutateAsync({ 
          productId, 
          quantity,
          isFreeItem: true,
          sourceDiscountId: buyGetModal.discountId,
        });
      }
    }
    
    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة المنتجات المجانية إلى السلة",
    });
    
    setBuyGetModal(null);
    setSelectedFreeProducts({});
  };

  const handleUpdateQuantity = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    updateItem.mutate(
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

  const handleRemoveItem = (itemId: string) => {
    removeItem.mutate(itemId, {
      onSuccess: () => {
        toast({
          title: "تم الحذف",
          description: "تم حذف المنتج من السلة",
        });
      },
      onError: (error) => {
        toast({
          title: "خطأ",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleClearCart = () => {
    if (confirm("هل أنت متأكد من إفراغ السلة؟")) {
      clearCart.mutate(undefined, {
        onSuccess: () => {
          toast({
            title: "تم الإفراغ",
            description: "تم إفراغ السلة بنجاح",
          });
        },
        onError: (error) => {
          toast({
            title: "خطأ",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const defaultImage = "https://api.builder.io/api/v1/image/assets/TEMP/17ef0156acec636f91e0fe561c504361d61052a2";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <div className="flex flex-col p-5 pb-6 items-end gap-6 flex-1">
          <PageHeader title="سلة التسوق" />
          <div className="flex justify-center items-center w-full py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FD7E14]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <div className="flex flex-col p-5 pb-6 items-end gap-6 flex-1">
        <div className="flex flex-row-reverse justify-between items-center w-full">
          <PageHeader title="سلة التسوق" />
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-500 text-sm hover:text-red-700"
            >
              إفراغ السلة
            </button>
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p className="text-[#6C757D] text-center">السلة فارغة</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 rounded-full bg-[#FD7E14] text-white text-sm hover:bg-[#E56D04] transition-colors"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end w-full rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex p-3 pb-3 items-start gap-3 w-full relative ${
                  index !== cartItems.length - 1 ? 'border-b border-[#DEE2E6]' : ''
                }`}
              >
                {/* Close icon button - top right */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeItem.isPending}
                  className="flex-shrink-0 bg-transparent border-0 absolute top-3 right-3 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#6C757D" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Product image */}
                <img
                  src={item.productImage || defaultImage}
                  alt={item.productName}
                  className="w-[62px] h-[66px] rounded-lg flex-shrink-0 object-cover"
                />
                <div className="flex flex-col items-end gap-1.5 flex-1 mr-3">
                  <span className="text-[#363636] text-right text-base font-normal leading-[130%] self-stretch">
                    {item.productNameAr || item.productName}
                  </span>
                  <span className="text-[#C0C0C0] text-right text-sm font-normal leading-[150%] self-stretch">
                    {item.unitPrice} جم / {item.unit}
                  </span>
                </div>

                {/* Quantity and Price column */}
                <div className="flex w-[110px] flex-col items-center gap-2.5 flex-shrink-0">
                  <div className="flex p-1 items-center justify-between w-full rounded-[21px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      disabled={updateItem.isPending}
                      className="flex w-6 h-6 p-[7px] justify-center items-center rounded-full bg-[#D3D3D3] hover:bg-[#C0C0C0] transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                        <path d="M0 1H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <span className="text-[#FD7E14] text-center text-lg font-medium leading-[120%] whitespace-nowrap flex-1 px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      disabled={updateItem.isPending || item.stockStatus === 'out_of_stock'}
                      className="flex w-6 h-6 p-[7px] justify-center items-center rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 0V12M0 6H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <span className="text-[#FD7E14] text-center text-base font-bold leading-[150%] self-stretch">
                    {item.totalPrice} جم
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Order Summary Footer */}
      {cartItems.length > 0 && (
        <div className="flex px-4 pt-[21px] pb-4 flex-col justify-end items-start gap-4 w-full bg-white shadow-[0_-11px_25px_0_rgba(0,0,0,0.12)]">
          <div className="flex px-6 flex-col items-start gap-4 w-full">
            {/* Applied Discounts */}
            {cart?.appliedDiscounts && cart.appliedDiscounts.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {cart.appliedDiscounts.map((discount: any) => (
                  <div key={discount.id} className="flex flex-col gap-2 w-full p-2 rounded-lg bg-[#E8F5E9]">
                    <div className="flex flex-row-reverse justify-between items-center w-full">
                      <div className="flex flex-col items-end">
                        <span className="text-[#2E7D32] text-sm font-medium text-right">
                          🎉 {discount.nameAr}
                        </span>
                      </div>
                      <span className="text-[#2E7D32] text-sm font-bold">
                        -{discount.discountAmount} جم
                      </span>
                    </div>
                    {/* Buy X Get Y - Select Free Products Button (only show if not already claimed) */}
                    {discount.type === 'buy_get' && discount.freeItemsCount > 0 && !discount.alreadyClaimed && (
                      <button
                        onClick={() => handleSelectFreeProducts(discount)}
                        className="w-full mt-1 py-2 px-3 rounded-full bg-[#2E7D32] text-white text-sm font-medium hover:bg-[#1B5E20] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        اختر {discount.freeItemsCount} منتجات مجانية
                      </button>
                    )}
                    {/* Show "Already claimed" badge if discount was already used */}
                    {discount.type === 'buy_get' && discount.alreadyClaimed && (
                      <div className="w-full mt-1 py-2 px-3 rounded-full bg-[#4CAF50]/20 text-[#2E7D32] text-sm font-medium text-center">
                        ✓ تم اختيار المنتجات المجانية
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-start gap-3 w-full">
              <div className="flex flex-row-reverse justify-between items-center w-full">
                <span className="text-[#6C757D] text-sm">
                  {cart?.summary?.itemCount || cartItems.length} منتجات
                </span>
              </div>
              
              {/* Subtotal */}
              <div className="flex flex-row-reverse justify-between items-center w-full">
                <span className="text-[#212529] text-base">
                  {cart?.summary?.subtotal} جم
                </span>
                <span className="text-[#6C757D] text-sm">
                  المجموع الفرعي
                </span>
              </div>

              {/* Discount if any */}
              {parseFloat(cart?.summary?.discount || '0') > 0 && (
                <div className="flex flex-row-reverse justify-between items-center w-full">
                  <span className="text-[#2E7D32] text-base font-medium">
                    -{cart?.summary?.discount} جم
                  </span>
                  <span className="text-[#2E7D32] text-sm">
                    الخصم
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex flex-row-reverse justify-between items-center w-full pt-2 border-t border-gray-200">
                <span className="text-[#FD7E14] text-xl font-bold">
                  {cart?.summary?.total || cart?.summary?.subtotal} جم
                </span>
                <span className="text-[#212529] text-right text-lg font-medium">
                  المجموع الكلي
                </span>
              </div>
            </div>
          </div>

          <div className="flex px-6 flex-col items-end gap-4 w-full">
            <button
              onClick={() => navigate("/products")}
              className="flex px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] transition-colors"
            >
              <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
                متابعة التسوق
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2H3.33333C3.77556 2 4.14889 2.37333 4.19111 2.81556L4.62667 7.68C4.71111 8.58667 5.52 9.33333 6.43556 9.33333H12.2356C13.0578 9.33333 13.7911 8.82667 14.0044 8.04444L14.9511 4.26222C15.1378 3.56444 14.6044 2.88889 13.8867 2.88889H4.83333M6.66667 13.3333C6.66667 13.9627 6.11556 14.5133 5.48667 14.5133C4.85778 14.5133 4.30667 13.9627 4.30667 13.3333C4.30667 12.704 4.85778 12.1533 5.48667 12.1533C6.11556 12.1533 6.66667 12.704 6.66667 13.3333ZM13.3333 13.3333C13.3333 13.9627 12.7822 14.5133 12.1533 14.5133C11.5244 14.5133 10.9733 13.9627 10.9733 13.3333C10.9733 12.704 11.5244 12.1533 12.1533 12.1533C12.7822 12.1533 13.3333 12.704 13.3333 13.3333Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="flex px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors active:scale-95"
            >
              <span className="text-white text-center text-base font-normal leading-[130%]">
                متابعة الشراء
              </span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 4.16667H2.5C1.57953 4.16667 0.833336 4.91286 0.833336 5.83333V14.1667C0.833336 15.0871 1.57953 15.8333 2.5 15.8333H17.5C18.4205 15.8333 19.1667 15.0871 19.1667 14.1667V5.83333C19.1667 4.91286 18.4205 4.16667 17.5 4.16667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0.833336 8.33333H19.1667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Buy X Get Y - Free Products Selection Modal */}
      {buyGetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[95%] max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => setBuyGetModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <h3 className="text-lg font-bold text-gray-900">
                🎁 اختر منتجاتك المجانية
              </h3>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-600 text-right mb-4">
                يمكنك اختيار {buyGetModal.freeItemsCount} منتجات مجانية من عرض "{buyGetModal.discountName}"
              </p>
              
              <p className="text-sm text-[#FD7E14] text-right mb-4 font-medium">
                تم اختيار {getTotalSelectedCount()} من {buyGetModal.freeItemsCount}
              </p>

              <div className="flex flex-col gap-3">
                {getEligibleProducts().map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <img
                      src={product.imageUrl || defaultImage}
                      alt={product.nameAr || product.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 flex flex-col items-end">
                      <span className="text-gray-900 text-sm font-medium text-right">
                        {product.nameAr || product.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        السعر الأصلي: {product.price} جم
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleProductSelect(product.id, -1)}
                        disabled={!selectedFreeProducts[product.id]}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                          <path d="M0 1H12" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <span className="w-8 text-center text-lg font-bold text-[#FD7E14]">
                        {selectedFreeProducts[product.id] || 0}
                      </span>
                      <button
                        onClick={() => handleProductSelect(product.id, 1)}
                        disabled={getTotalSelectedCount() >= buyGetModal.freeItemsCount}
                        className="w-8 h-8 rounded-full bg-[#FD7E14] flex items-center justify-center hover:bg-[#E56D04] disabled:opacity-50 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 0V12M0 6H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setBuyGetModal(null)}
                className="flex-1 py-3 px-4 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmFreeProducts}
                disabled={getTotalSelectedCount() === 0 || addToCart.isPending}
                className="flex-1 py-3 px-4 rounded-full bg-[#2E7D32] text-white font-medium hover:bg-[#1B5E20] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {addToCart.isPending ? 'جاري الإضافة...' : `تأكيد (${getTotalSelectedCount()} منتجات)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
