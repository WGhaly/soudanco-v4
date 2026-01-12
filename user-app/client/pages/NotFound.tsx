import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-end justify-center bg-[#F8F9FA] px-4">
      <div className="flex flex-col items-end gap-4 w-full max-w-md">
        <h1 className="text-[#FD7E14] text-right text-6xl font-bold">404</h1>
        <p className="text-[#363636] text-right text-2xl font-medium">الصفحة غير موجودة</p>
        <p className="text-[#6C757D] text-right text-base font-normal">
          عذراً، الصفحة التي تبحث عنها غير موجودة.
        </p>
        <a
          href="/"
          className="flex px-6 py-2.5 justify-center items-center gap-2.5 w-full rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors text-white text-center text-base font-normal leading-[130%]"
        >
          العودة إلى الرئيسية
        </a>
      </div>
    </div>
  );
};

export default NotFound;
