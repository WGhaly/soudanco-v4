
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import PullToRefresh from "@/components/PullToRefresh";
import { useAuth } from "@/lib/auth";
import { useProducts } from "@/hooks/useProducts";
import { useDashboard, useCustomerDiscounts } from "@/hooks/useProfile";
import { useAddToCart, useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const bannerImages = [
  "/assets/Rectangle 1.jpg",
  "/assets/Rectangle 2.jpg",
  "/assets/Rectangle 3.jpg",
];

export default function Home() {
  const { customer } = useAuth();
  const { toast } = useToast();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 6 });
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: discountsData } = useCustomerDiscounts();
  const addToCart = useAddToCart();
  const { data: cartData } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  
  const products = productsData?.data || [];
  const dashboard = dashboardData?.data;
  const discounts = discountsData?.data || [];
  const activeDiscounts = discounts.filter(d => d.isActive);

  // Helper to get cart info for a product
  const getCartInfo = (productId: string) => {
    const cartItems = cartData?.data?.items || [];
    const cartItem = cartItems.find((item: any) => item.productId === productId && !item.isFreeItem);
    return {
      cartQuantity: cartItem?.quantity || 0,
      cartItemId: cartItem?.id || null,
    };
  };

  // Auto-rotate carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate promotions carousel
  useEffect(() => {
    if (activeDiscounts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % activeDiscounts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDiscounts.length]);

  useEffect(() => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const images = container.querySelectorAll('img');
      if (images[currentSlide]) {
        const targetImage = images[currentSlide] as HTMLElement;
        const scrollPosition = targetImage.offsetLeft - 8; // account for padding
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentSlide]);

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

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    updateCartItem.mutate(
      { id: cartItemId, quantity: newQuantity },
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

  const handleRemoveFromCart = (cartItemId: string) => {
    removeCartItem.mutate(cartItemId, {
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

  const defaultImage = "https://api.builder.io/api/v1/image/assets/TEMP/86501bd89bfb43fe0882378e0ea38736bf4ebf29";

  return (
    <PullToRefresh>
      <div className="flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-24 min-h-screen">
        <PageHeader showBackButton={false} showCart={true} />
      
        <div className="flex flex-col items-center gap-10 w-full">
        {/* Ads Banner - Auto-rotating Carousel */}
        <div className="w-full flex flex-col items-center gap-3">
          <div 
            ref={carouselRef}
            className="flex h-[185px] gap-4 w-full max-w-3xl overflow-x-auto scrollbar-hide px-2"
          >
            {bannerImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Banner ${index + 1}`}
                className="min-w-[372px] h-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          {/* Carousel Indicators */}
          <div className="flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-[#FD7E14]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="flex flex-row-reverse w-full items-stretch gap-[7px]">
          <div className="flex p-3 flex-col items-end gap-[11px] flex-1 rounded-2xl bg-white hover:shadow-md transition-shadow h-full">
            <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
              الرصيد المستحق
            </p>
            <p className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
              {dashboardLoading ? "..." : `${parseFloat(dashboard?.currentBalance || "0").toLocaleString('ar-EG')} جنيه`}
            </p>
          </div>

          <div className="flex p-3 flex-col items-end gap-[11px] flex-1 rounded-2xl bg-white hover:shadow-md transition-shadow h-full">
            <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
              الرصيد<br />المتاح
            </p>
            <p className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
              {dashboardLoading ? "..." : `${parseFloat(dashboard?.availableCredit || "0").toLocaleString('ar-EG')} جنيه`}
            </p>
          </div>

          <div className="flex p-3 flex-col items-end gap-[11px] flex-1 rounded-2xl bg-white hover:shadow-md transition-shadow h-full">
            <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
              طلبات<br />قيد التنفيذ
            </p>
            <p className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
              {dashboardLoading ? "..." : (dashboard?.pendingOrders || 0)}
            </p>
          </div>
        </div>

        {/* Promotions Carousel */}
        {activeDiscounts.length > 0 && (
          <div className="w-full overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${currentPromoSlide * 100}%)` }}
            >
              {activeDiscounts.map((discount, index) => (
                <div 
                  key={discount.id || index}
                  className="w-full flex-shrink-0 px-0.5"
                  style={{ direction: 'rtl' }}
                >
                  <div className="flex p-[13px] px-4 flex-col items-end gap-2 w-full rounded-lg bg-[rgba(253,126,20,0.1)]">
                    <div className="flex items-center gap-2 w-full justify-end">
                      <span className="text-[#FD7E14] text-2xl">🎉</span>
                      <h3 className="text-[#FD7E14] text-right text-base font-bold leading-[150%]">
                        {discount.discountType === 'buy_get' 
                          ? `اشتري ${discount.minQuantity || ''} واحصل على ${discount.bonusQuantity || ''} مجاناً`
                          : `خصم ${discount.discountValue} ${discount.discountType === 'percentage' ? '%' : 'ج.م'}`
                        }
                      </h3>
                    </div>
                    <p className="text-[#FD9843] text-right text-base font-medium leading-[120%] w-full">
                      {discount.discountName}
                    </p>
                    {discount.validUntil && (
                      <p className="text-[#FD9843] text-right text-xs font-normal leading-[150%] w-full">
                        متاح حتى {new Date(discount.validUntil).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Section */}
        {dashboard?.recentOrders && dashboard.recentOrders.length > 0 && (
          <div className="flex flex-col items-end gap-3.5 w-full">
            <div className="flex flex-row-reverse items-center justify-between w-full">
              <Link to="/orders" className="flex flex-row-reverse items-center gap-2 max-sm:mr-auto">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 2L2 8L5 14" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[#ADB5BD] text-sm font-normal leading-[150%] max-sm:ml-auto">
                  عرض المزيد
                </span>
              </Link>
              <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] max-sm:ml-auto">
                الطلبات الأخيرة
              </h2>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {dashboard.recentOrders.slice(0, 3).map((order) => (
                <Link 
                  key={order.id} 
                  to={`/order/${order.id}`}
                  className="flex flex-row justify-between items-center p-3 w-full bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Right side: order name/code and date */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[#212529] text-right text-sm font-medium">
                      طلب #{order.orderNumber}
                    </span>
                    <div className="w-full flex">
                      <span className="text-[#6C757D] text-left text-xs">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  {/* Left side: price and status tag */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[#FD7E14] text-sm font-medium">{order.total} ج.م</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status === 'pending' ? 'قيد الانتظار' :
                       order.status === 'processing' ? 'قيد التجهيز' :
                       order.status === 'shipped' ? 'تم الشحن' :
                       order.status === 'delivered' ? 'تم التوصيل' :
                       'ملغي'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="flex flex-col items-end gap-3.5 w-full">
          <h2 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
            المنتجات المتاحة
          </h2>

          {productsLoading ? (
            <div className="flex justify-center items-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7E14]"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              {products.map((product, idx) => {
                // Remove 'soda' from the title for the card on the right in the third row
                let title = product.nameAr || product.name;
                if (
                  // 3rd row, right card: idx === 4 in a 0-based, 2-column grid
                  idx === 4
                ) {
                  title = title.replace(/soda|Soda|صودا/g, '').replace(/\s+/g, ' ').trim();
                }
                const { cartQuantity, cartItemId } = getCartInfo(product.id);
                return (
                  <div
                    key={product.id}
                    className={
                      products.length % 2 === 1 && idx === products.length - 1
                        ? 'flex flex-col h-full -mt-3'
                        : 'flex flex-col h-full'
                    }
                  >
                    <ProductCard
                      image={product.imageUrl || defaultImage}
                      title={title}
                      subtitle={`${product.unitsPerCase} ${product.unit}`}
                      price={`${product.price} جم / ${product.unit}`}
                      productId={product.id}
                      cartQuantity={cartQuantity}
                      cartItemId={cartItemId}
                      onAddToCart={(qty) => handleAddToCart(product.id, qty)}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveFromCart={handleRemoveFromCart}
                      outOfStock={product.stockStatus === 'out_of_stock'}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center w-full py-8">
              <p className="text-[#6C757D] text-center">لا توجد منتجات متاحة</p>
            </div>
          )}
        </div>

        <Link to="/products" className="w-full">
          <button className="flex px-4 py-3.5 justify-center items-center gap-3 w-full rounded-full bg-[#FD7E14] shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] hover:bg-[#E56D04] transition-colors active:scale-95">
            <span className="text-white text-center text-base font-normal leading-[130%]">
              عرض جميع المنتجات
            </span>
          </button>
        </Link>


      </div>

      <BottomNav />
      </div>
    </PullToRefresh>
  );
}
