import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Edit, Loader2, Calendar, Package, Percent, DollarSign, ShoppingCart, Gift } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useDiscount } from "@/hooks/useDiscounts";

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    buy_get: 'اشتري واحصل',
    spend_bonus: 'أنفق واحصل'
  };
  return labels[type] || type;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'percentage':
      return <Percent className="w-5 h-5" />;
    case 'fixed':
      return <DollarSign className="w-5 h-5" />;
    case 'buy_get':
      return <Gift className="w-5 h-5" />;
    case 'spend_bonus':
      return <ShoppingCart className="w-5 h-5" />;
    default:
      return <Percent className="w-5 h-5" />;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('ar-EG')} ج.م`;
}

export default function DiscountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch discount data from API
  const { data: discountData, isLoading, error } = useDiscount(id);
  const discount = discountData?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error || !discount) {
    return (
      <div className="flex min-h-screen bg-[#FFF] items-center justify-center" dir="rtl">
        <p className="text-red-500">فشل في تحميل بيانات الخصم</p>
      </div>
    );
  }

  // Check discount status
  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);
  
  let status = 'inactive';
  let statusLabel = 'غير نشط';
  let statusColor = 'bg-gray-100 text-gray-600';
  
  if (!discount.isActive) {
    status = 'inactive';
    statusLabel = 'غير نشط';
    statusColor = 'bg-gray-100 text-gray-600';
  } else if (now < startDate) {
    status = 'scheduled';
    statusLabel = 'مجدول';
    statusColor = 'bg-blue-100 text-blue-600';
  } else if (now > endDate) {
    status = 'expired';
    statusLabel = 'منتهي';
    statusColor = 'bg-red-100 text-red-600';
  } else {
    status = 'active';
    statusLabel = 'نشط';
    statusColor = 'bg-green-100 text-green-600';
  }

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="w-full flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-row items-center gap-4">
            {/* Title - Right */}
            <h1 className="flex-1 text-[32px] font-medium leading-[120%] text-brand-primary text-right">
              تفاصيل الخصم
            </h1>
            
            {/* Edit Data Button */}
            <button
              onClick={() => navigate(`/discounts/${id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
            >
              <span className="text-white text-base font-normal leading-[130%]">
                تعديل الخصم
              </span>
              <Edit className="w-4 h-4 text-white" />
            </button>

            {/* Back Button - Left */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium bg-brand-primary/10 text-brand-primary flex items-center gap-2`}>
              {getTypeIcon(discount.type)}
              {getTypeLabel(discount.type)}
            </span>
          </div>

          {/* Discount Information Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-medium leading-[120%] text-gray-secondary text-right">
              معلومات الخصم
            </h2>

            {/* Name Fields */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Arabic Name */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-body-text text-right">
                  الاسم بالعربية
                </label>
                <div className="text-base font-bold leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                  {discount.nameAr || '-'}
                </div>
              </div>

              {/* English Name */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-body-text text-right">
                  الاسم بالإنجليزية
                </label>
                <div className="text-base font-bold leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                  {discount.name}
                </div>
              </div>
            </div>

            {/* Description */}
            {discount.description && (
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium leading-[120%] text-body-text text-right">
                  الوصف
                </label>
                <div className="text-base leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                  {discount.description}
                </div>
              </div>
            )}

            {/* Discount Value */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-body-text text-right">
                  قيمة الخصم
                </label>
                <div className="text-xl font-bold leading-[150%] text-brand-primary text-right p-3 bg-brand-primary/5 rounded-lg">
                  {discount.type === 'percentage' || discount.type === 'spend_bonus' 
                    ? `${discount.value}%` 
                    : discount.type === 'buy_get' 
                      ? `اشتري ${discount.minQuantity || 0} واحصل على ${discount.bonusQuantity || 0} مجاناً`
                      : formatCurrency(discount.value)
                  }
                </div>
              </div>

              {discount.minOrderAmount && (
                <div className="flex flex-col gap-3 flex-1">
                  <label className="text-base font-medium leading-[120%] text-body-text text-right">
                    الحد الأدنى للطلب
                  </label>
                  <div className="text-base font-bold leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                    {formatCurrency(discount.minOrderAmount)}
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-body-text text-right flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ البداية
                </label>
                <div className="text-base font-bold leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                  {formatDate(discount.startDate)}
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <label className="text-base font-medium leading-[120%] text-body-text text-right flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ الانتهاء
                </label>
                <div className="text-base font-bold leading-[150%] text-body-text text-right p-3 bg-gray-50 rounded-lg">
                  {formatDate(discount.endDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          {discount.products && discount.products.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-medium leading-[120%] text-gray-secondary text-right flex items-center gap-2">
                <Package className="w-6 h-6" />
                المنتجات المطبق عليها الخصم ({discount.products.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discount.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex-1 text-right">
                      <div className="text-base font-medium text-body-text">
                        {product.nameAr || product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sku} • {formatCurrency(product.basePrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If no specific products, show global discount message */}
          {(!discount.products || discount.products.length === 0) && (
            <div className="flex flex-col gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Package className="w-5 h-5" />
                <span className="font-medium">خصم عام</span>
              </div>
              <p className="text-blue-600 text-sm text-right">
                هذا الخصم يُطبق على جميع المنتجات
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>تاريخ الإنشاء:</span>
                <span>{formatDate(discount.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>آخر تحديث:</span>
                <span>{formatDate(discount.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
