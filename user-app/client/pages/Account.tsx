import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import { useAuth } from "@/lib/auth";
import { useDashboard } from "@/hooks/useProfile";

export default function Account() {
  const navigate = useNavigate();
  const { customer, logout } = useAuth();
  const { data: dashboardData } = useDashboard();
  
  const dashboard = dashboardData?.data;

  const handleLogout = async () => {
    if (confirm("هل تريد تسجيل الخروج؟")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <PullToRefresh>
      <div className="min-h-screen flex flex-col items-end gap-6 bg-[#F8F9FA] p-5 pb-24">
        <PageHeader showBackButton={false} showCart={true} />
      
        <div className="flex flex-col justify-between items-end flex-1 w-full">
          <div className="flex px-4 flex-col items-end gap-6 w-full">
            {/* User Info */}
            <div className="flex flex-row-reverse items-center gap-[7px] w-full">
              <div className="flex flex-col items-end gap-3 flex-1">
              <h2 className="text-[#363636] text-right text-2xl font-normal leading-[150%] w-full">
                {customer?.contactName || customer?.businessName || "المستخدم"}
              </h2>
              <p className="h-[17px] text-[#C0C0C0] text-right text-sm font-normal leading-normal w-full">
                {customer?.phone}
              </p>
            </div>
          </div>

          {/* Credit Limit */}
          <div className="flex flex-col items-end gap-2.5 w-full">
            <div className="flex flex-row-reverse px-4 py-3 items-center gap-[45px] w-full rounded-lg bg-[#FD7E14]">
              <span className="text-white text-xl font-medium leading-[120%]">
                {customer?.creditLimit || "0"} جم
              </span>
              <div className="flex flex-row-reverse items-center gap-1.5 flex-1">
                <span className="flex-1 text-white text-right text-xl font-medium leading-[120%]">
                  الحد الاتماني
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-row-reverse gap-3 w-full">
            <div className="flex-1 p-3 bg-white rounded-lg text-center">
              <p className="text-[#FD7E14] text-2xl font-medium">{dashboard?.totalOrders || 0}</p>
              <p className="text-[#6C757D] text-sm">إجمالي الطلبات</p>
            </div>
            <div className="flex-1 p-3 bg-white rounded-lg text-center">
              <p className="text-[#FD7E14] text-2xl font-medium">{dashboard?.pendingOrders || 0}</p>
              <p className="text-[#6C757D] text-sm">طلبات قيد التنفيذ</p>
            </div>
            <div className="flex-1 p-3 bg-white rounded-lg text-center">
              <p className="text-[#FD7E14] text-2xl font-medium">{dashboard?.activeDiscounts || 0}</p>
              <p className="text-[#6C757D] text-sm">خصومات نشطة</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col items-end gap-3 w-full">
            <Link
              to="/wallet"
              className="flex flex-row-reverse px-6 py-2 items-center gap-4 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 2L2 8L5 14" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">
                المحفظة
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 6.66667H2.5V15.8333H17.5V6.66667Z" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 10.8333C15 11.2936 14.6269 11.6667 14.1667 11.6667C13.7064 11.6667 13.3333 11.2936 13.3333 10.8333C13.3333 10.3731 13.7064 10 14.1667 10C14.6269 10 15 10.3731 15 10.8333Z" fill="#212529"/>
                <path d="M2.5 6.66667L3.75 3.33333H16.25L17.5 6.66667" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <Link
              to="/address"
              className="flex flex-row-reverse px-6 py-2 items-center gap-4 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 2L2 8L5 14" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">
                العنوان
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 17.5C10 17.5 3.75 12.5 3.75 7.5C3.75 5.84315 4.40848 4.25 5.58058 3.08058C6.75269 1.91071 8.34315 1.25 10 1.25C11.6569 1.25 13.2473 1.91071 14.4194 3.08058C15.5915 4.25 16.25 5.84315 16.25 7.5C16.25 12.5 10 17.5 10 17.5Z" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <Link
              to="/orders"
              className="flex flex-row-reverse px-6 py-2 items-center gap-4 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 2L2 8L5 14" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">
                الطلبات
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33333 2.5H0.833333V20H19.1667V2.5H16.6667M3.33333 2.5V0H16.6667V2.5M3.33333 2.5H16.6667" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <Link
              to="/settings"
              className="flex flex-row-reverse px-6 py-2 items-center gap-4 w-full hover:bg-[#F1F1F1] rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 2L2 8L5 14" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#212529] text-right text-xl font-medium leading-[120%]">
                إعدادات الحساب
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <g clipPath="url(#clip0_gear)">
                  <path d="M10.8333 1.66667H9.16667V3.75C8.5 3.91667 7.91667 4.25 7.5 4.75L5.83333 3.08333L4.66667 4.25L6.33333 5.91667C5.83333 6.41667 5.5 7 5.33333 7.66667H3.25V9.33333H5.33333C5.5 10 5.83333 10.5833 6.33333 11.0833L4.66667 12.75L5.83333 13.9167L7.5 12.25C7.91667 12.75 8.5 13.0833 9.16667 13.25V15.3333H10.8333V13.25C11.5 13.0833 12.0833 12.75 12.5 12.25L14.1667 13.9167L15.3333 12.75L13.6667 11.0833C14.1667 10.5833 14.5 10 14.6667 9.33333H16.75V7.66667H14.6667C14.5 7 14.1667 6.41667 13.6667 5.91667L15.3333 4.25L14.1667 3.08333L12.5 4.75C12.0833 4.25 11.5 3.91667 10.8333 3.75V1.66667Z" stroke="#212529" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="8.5" r="1.66667" stroke="#212529" strokeWidth="1.5"/>
                </g>
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex px-6 pt-3 pb-6 flex-col items-end gap-3 w-full border-t border-[#DEE2E6]">
          <button
            onClick={handleLogout}
            className="flex flex-row-reverse px-6 py-2 items-center gap-3 w-full hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="#DC3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flex-1 text-[#DC3545] text-right text-xl font-medium leading-[120%]">
              تسجيل الخروج
            </span>
          </button>
        </div>
        {/* Safe space for bottom navigation */}
        <div className="h-20"></div>
      </div>

      <BottomNav />
      </div>
    </PullToRefresh>
  );
}
