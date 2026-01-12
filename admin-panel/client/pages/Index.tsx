import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ActionButton from "@/components/ActionButton";
import LogoutModal from "@/components/LogoutModal";
import { useDashboard, getOrderStatusAr, formatDate } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

export default function Index() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { data, isLoading, error } = useDashboard();

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    console.log("User logged out");
  };

  const stats = data?.data?.stats;
  const recentOrders = data?.data?.recentOrders || [];

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex">
        <div className="flex flex-col items-center flex-1 w-full">
          <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
            {/* Page Header */}
            <div className="flex items-end gap-8 md:gap-[60px] self-stretch">
              <h1 className="text-primary text-right text-2xl md:text-[32px] font-medium leading-[120%] flex-1">
                لوحة التحكم
              </h1>
            </div>

            {/* Statistics Cards */}
            <div className="flex flex-col items-start gap-4 md:gap-6 w-full">
              <div className="flex flex-col md:flex-row items-center gap-3 self-stretch">
                {isLoading ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center w-full py-4">
                    فشل في تحميل الإحصائيات
                  </div>
                ) : (
                  <>
                    <StatCard title="الطلبات الواردة" value={String(stats?.incomingOrders || 0)} />
                    <StatCard title="إجمالي الطلبات المعلّقة" value={String(stats?.pendingOrders || 0)} />
                    <StatCard title="إجمالي المستحق" value={`${stats?.outstandingBalance || '0'} ر.س`} />
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
              <ActionButton label="قائمة أسعار" href="/price-lists/add" />
              <ActionButton label="عرض ترويجي" href="/discounts/add" />
              <ActionButton label="عميل جديد" href="/customers/new" />
              <ActionButton label="منتج جديد" href="/products/new" />
            </div>

            {/* Orders Table */}
            <div className="w-full">
              <h2 className="text-xl font-medium text-primary mb-4">آخر الطلبات</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  لا توجد طلبات حديثة
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الطلب</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">العميل</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجمالي</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link to={`/orders/${order.id}`} className="text-primary hover:underline">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {order.customer?.businessNameAr || order.customer?.businessName || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-900">{order.total} ر.س</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {getOrderStatusAr(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
