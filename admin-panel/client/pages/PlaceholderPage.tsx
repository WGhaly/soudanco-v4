import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function PlaceholderPage() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pageName = location.pathname.replace("/", "").replace("-", " ");

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="rtl">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-md">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-brand-primary text-xl font-medium">سودانكو</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-[60px] flex mt-16 md:mt-0">
        <div className="flex flex-col items-center flex-1 w-full">
          <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[400px]">
            {/* Placeholder Content */}
            <div className="flex flex-col items-center gap-6 p-8 md:p-12 rounded-2xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="40" cy="40" r="40" fill="#FD7E14" fillOpacity="0.1" />
                <path
                  d="M40 20V60M20 40H60"
                  stroke="#FD7E14"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-body-text text-xl md:text-2xl font-medium text-center">
                  {pageName ? `صفحة ${pageName}` : "صفحة قيد الإنشاء"}
                </h2>
                <p className="text-gray-secondary text-sm md:text-base text-center max-w-md px-4">
                  هذه الصفحة قيد التطوير. يمكنك متابعة المحادثة لإنشاء محتوى هذه الصفحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
