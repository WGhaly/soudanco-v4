
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/lib/auth";
import { useProducts } from "@/hooks/useProducts";
import { useDashboard, useCustomerDiscounts } from "@/hooks/useProfile";
import { useAddToCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { customer } = useAuth();
  const { toast } = useToast();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 6 });
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: discountsData } = useCustomerDiscounts();
  const addToCart = useAddToCart();
  
  const products = productsData?.data || [];
  const dashboard = dashboardData?.data;
  const discounts = discountsData?.data || [];
  const activeDiscount = discounts.find(d => d.isActive);

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

  const defaultImage = "https://api.builder.io/api/v1/image/assets/TEMP/86501bd89bfb43fe0882378e0ea38736bf4ebf29";

  return (
    <div className="flex flex-col items-end gap-6 bg-[#F8F9FA] p-5">
      <PageHeader showBackButton={false} showCart={true} />
      
      <div className="flex flex-col items-center gap-10 w-full">
        {/* Ads Banner - Scrollable Carousel */}
        <div className="w-full flex justify-center">
          <div className="flex h-[185px] gap-4 w-full max-w-3xl overflow-x-auto scrollbar-hide px-2">
            <img
              src="/assets/Rectangle 2.jpg"
              alt="Banner Center"
              className="min-w-[372px] h-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity mx-auto"
              style={{ order: 2 }}
            />
            <img
              src="/assets/Rectangle 1.jpg"
              alt="Banner Left"
              className="min-w-[372px] h-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
              style={{ order: 1 }}
            />
            <img
              src="/assets/Rectangle 3.jpg"
              alt="Banner Right"
              className="min-w-[372px] h-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
              style={{ order: 3 }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="flex flex-row-reverse w-full items-stretch gap-[7px]">
          <div className="flex p-3 flex-col items-end gap-[11px] flex-1 rounded-2xl bg-white hover:shadow-md transition-shadow h-full">
            <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
              الرصيد المستحق
            </p>
            <p className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
              {dashboardLoading ? "..." : (dashboard?.currentBalance || "0")}
            </p>
          </div>

          <div className="flex p-3 flex-col items-end gap-[11px] flex-1 rounded-2xl bg-white hover:shadow-md transition-shadow h-full">
            <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
              الحد<br />الائتماني
            </p>
            <p className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
              {dashboardLoading ? "..." : (dashboard?.creditLimit || "0")}
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

        {/* Discount Goal */}
        {activeDiscount && (
          <div className="flex p-[13px] px-4 flex-col items-end gap-2 w-full rounded-lg bg-[rgba(253,126,20,0.1)] hover:bg-[rgba(253,126,20,0.15)] transition-colors cursor-pointer">
            <h3 className="text-[#FD7E14] text-right text-base font-bold leading-[150%] w-full">
              خصم {activeDiscount.discountValue} {activeDiscount.discountType === 'percentage' ? '%' : 'ج.م'}
            </h3>
            <p className="text-[#FD9843] text-right text-base font-medium leading-[120%] w-full flex-1">
              {activeDiscount.discountName}
            </p>
            <div className="flex flex-row-reverse h-4 items-center w-full">
              <div className="flex-1 h-full rounded-l-[30px] bg-[#FD7E14]"></div>
              <div className="flex-1 h-full rounded-r-[30px] bg-[#FECBA1]"></div>
            </div>
            {activeDiscount.validUntil && (
              <p className="text-[#FD9843] text-right text-xs font-normal leading-[150%] w-full">
                متاح حتى {new Date(activeDiscount.validUntil).toLocaleDateString('ar-EG')}
              </p>
            )}
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
                      onAddToCart={(qty) => handleAddToCart(product.id, qty)}
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

        {/* Info Cards */}
        <div className="flex flex-col items-end gap-3 w-full rounded-lg">
          <div className="flex flex-row-reverse px-6 py-1.5 flex-col items-end w-full border-b border-[#DEE2E6] hover:bg-[#F1F1F1] rounded-lg transition-colors cursor-pointer">
            <div className="flex flex-col justify-center items-center gap-2.5 w-full">
              <div className="flex flex-row-reverse items-center gap-1.5 w-full">
                <h3 className="flex-1 text-[#FD7E14] text-right text-base font-medium leading-[120%]">
                  جودة موثوقة
                </h3>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10.163 5.37607L15 6.12786L11.5 9.52786L12.326 14.3443L8 12.0761L3.674 14.3443L4.5 9.52786L1 6.12786L5.837 5.37607L8 1Z" fill="#FD7E14"/>
                </svg>
              </div>
              <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
                منتجات أصلية 100%
              </p>
            </div>
          </div>
          
          <div className="flex flex-row-reverse px-6 py-1.5 flex-col items-end w-full border-b border-[#DEE2E6] hover:bg-[#F1F1F1] rounded-lg transition-colors cursor-pointer">
            <div className="flex flex-col justify-center items-center gap-2.5 w-full">
              <div className="flex flex-row-reverse items-center gap-1.5 w-full">
                <h3 className="flex-1 text-[#FD7E14] text-right text-base font-medium leading-[120%]">
                  توصيل سريع
                </h3>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="#FD7E14"/>
                  <path d="M8 5V8L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
                توصيل خلال 24-48 ساعة
              </p>
            </div>
          </div>
          
          <div className="flex flex-row-reverse px-6 py-1.5 flex-col items-end w-full border-b border-[#DEE2E6] hover:bg-[#F1F1F1] rounded-lg transition-colors cursor-pointer">
            <div className="flex flex-col justify-center items-center gap-2.5 w-full">
              <div className="flex flex-row-reverse items-center gap-1.5 w-full">
                <h3 className="flex-1 text-[#FD7E14] text-right text-base font-medium leading-[120%]">
                  دعم على مدار الساعة
                </h3>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 6H14M2 10H14M6 2L8 14M10 2L8 14" stroke="#FD7E14" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="text-[#6C757D] text-right text-sm font-normal leading-[150%] w-full">
                فريق دعم متاح دائماً لمساعدتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
