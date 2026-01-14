import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function NewCustomer() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FFF]" dir="ltr">
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
          <div className="flex flex-col items-end gap-6 md:gap-8 w-full">
            {/* Page Header */}
            <div className="flex flex-col items-end gap-6 md:gap-8 self-stretch">
              <div className="flex justify-between items-center self-stretch">
                <div className="flex items-center gap-3">
                  <Link
                    to="/customers"
                    className="flex w-10 h-10 justify-center items-center rounded-full bg-brand-primary hover:opacity-90"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 15L6 10L11 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <button className="flex justify-center items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1.5 transition-opacity hover:opacity-90">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-white text-center text-base font-normal leading-[130%]">إنشاء العميل</span>
                  </button>
                </div>
                <h1 className="text-brand-primary text-right text-2xl md:text-[32px] font-medium leading-[120%]">
                  اضافة عميل جديد
                </h1>
              </div>

              <h2 className="self-stretch text-gray-secondary text-right text-xl md:text-2xl font-medium leading-[120%]">
                النور ماركت
              </h2>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col justify-center items-end gap-6 self-stretch">
              <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                <div className="flex flex-col items-start gap-1.5 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-base font-medium leading-[120%]">المنطقة</label>
                  </div>
                  <div className="flex justify-end items-center gap-2.5 self-stretch rounded-full border border-white bg-white px-4 py-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">المنطقة</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-right text-base font-medium leading-[120%]">الاسم</label>
                  </div>
                  <div className="flex justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white px-3 py-3">
                    <input
                      type="text"
                      placeholder="اسم العميل"
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] placeholder:text-gray-500 bg-transparent outline-none border-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-right text-base font-medium leading-[120%]">رقم الهاتف</label>
                  </div>
                  <div className="flex justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white px-3 py-3">
                    <input
                      type="tel"
                      placeholder="(+20)  012xxxxxxxx"
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] placeholder:text-gray-500 bg-transparent outline-none border-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-right text-base font-medium leading-[120%]">البريد الالكتروني</label>
                  </div>
                  <div className="flex justify-center items-center gap-2.5 self-stretch rounded-full border border-theme-border bg-white px-3 py-3">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%] placeholder:text-gray-500 bg-transparent outline-none border-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 self-stretch">
                <div className="flex flex-col items-start gap-1.5 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-base font-medium leading-[120%]">تفعيل الحساب</label>
                  </div>
                  <div className="flex justify-end items-center gap-2.5 self-stretch rounded-full border border-white bg-white px-4 py-2.5">
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className="relative w-8 h-[17px]"
                    >
                      {isActive ? (
                        <div className="relative w-8 h-[17px]">
                          <div className="absolute w-8 h-[17px] rounded-full border-2 border-brand-primary bg-brand-primary"></div>
                          <div className="absolute w-3.5 h-3.5 rounded-full bg-white left-[17px] top-0.5"></div>
                        </div>
                      ) : (
                        <div className="relative w-8 h-[17px]">
                          <svg className="absolute w-8 h-[17px]" viewBox="0 0 36 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.5 1C30.7467 1 35 5.2533 35 10.5C35 15.7467 30.7467 20 25.5 20H10.5C5.2533 20 1 15.7467 1 10.5C1 5.2533 5.2533 1 10.5 1H25.5Z" stroke="#FD7E14" strokeWidth="2"/>
                          </svg>
                          <div className="absolute w-3.5 h-3.5 rounded-full bg-brand-primary left-0.5 top-0.5"></div>
                        </div>
                      )}
                    </button>
                    <span className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">
                      حساب غير مفعل
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1.5 flex-1 self-stretch w-full">
                  <div className="flex justify-end items-start gap-1 self-stretch">
                    <label className="text-new-black-color text-base font-medium leading-[120%]">قائمة الاسعار</label>
                  </div>
                  <div className="flex justify-end items-center gap-2.5 self-stretch rounded-full border border-white bg-white px-4 py-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">قائمة الاسعار</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
