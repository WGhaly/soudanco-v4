import { useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function Settings() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  return (
    <div className="min-h-screen flex flex-col justify-between items-end bg-[#F8F9FA] p-5 pb-32">
      <div className="flex flex-col items-end gap-6 flex-1 w-full">
        <PageHeader title="اعدادات الحساب" />
        
        <div className="flex flex-col items-end gap-4 w-full">
          <h2 className="text-[#363636] text-right text-base font-medium leading-[120%] w-full">
            بيانات الحساب
          </h2>
          
          <div className="flex flex-row-reverse justify-end items-start gap-2.5 w-full">
            <div className="flex flex-col items-end gap-1.5 flex-1">
              <div className="flex flex-row-reverse justify-end items-start gap-1 w-full">
                <span className="text-[#363636] text-base font-medium leading-[120%]">
                  الاسم الأول
                </span>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M3.99993 0C4.27607 0 4.49993 0.223858 4.49993 0.5V3.13398L6.78103 1.81699C7.02017 1.67892 7.32597 1.76085 7.46404 2C7.60211 2.23915 7.52017 2.54494 7.28103 2.68301L4.99993 4L7.28101 5.31699C7.52016 5.45506 7.6021 5.76085 7.46402 6C7.32595 6.23915 7.02016 6.32108 6.78101 6.18301L4.49993 4.86603V7.5C4.49993 7.77614 4.27607 8 3.99993 8C3.72379 8 3.49993 7.77614 3.49993 7.5V4.86603L1.21885 6.18301C0.979704 6.32108 0.673909 6.23915 0.535837 6C0.397766 5.76085 0.479704 5.45506 0.71885 5.31699L2.99993 4L0.718834 2.68301C0.479687 2.54494 0.39775 2.23915 0.535821 2C0.673892 1.76085 0.979687 1.67892 1.21883 1.81699L3.49993 3.13398V0.5C3.49993 0.223858 3.72379 0 3.99993 0Z" fill="#DC3545"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="اكتب الاجابة هنا"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="flex px-3 py-3 justify-center items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-white text-[#ADB5BD] text-right text-base font-normal leading-[130%] focus:outline-none focus:ring-2 focus:ring-[#FD7E14]"
                dir="rtl"
              />
            </div>
            
            <div className="flex flex-col items-end gap-1.5 flex-1">
              <div className="flex flex-row-reverse justify-end items-start gap-1 w-full">
                <span className="text-[#363636] text-base font-medium leading-[120%]">
                  الاسم الأخير
                </span>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M3.99993 0C4.27607 0 4.49993 0.223858 4.49993 0.5V3.13398L6.78103 1.81699C7.02017 1.67892 7.32597 1.76085 7.46404 2C7.60211 2.23915 7.52017 2.54494 7.28103 2.68301L4.99993 4L7.28101 5.31699C7.52016 5.45506 7.6021 5.76085 7.46402 6C7.32595 6.23915 7.02016 6.32108 6.78101 6.18301L4.49993 4.86603V7.5C4.49993 7.77614 4.27607 8 3.99993 8C3.72379 8 3.49993 7.77614 3.49993 7.5V4.86603L1.21885 6.18301C0.979704 6.32108 0.673909 6.23915 0.535837 6C0.397766 5.76085 0.479704 5.45506 0.71885 5.31699L2.99993 4L0.718834 2.68301C0.479687 2.54494 0.39775 2.23915 0.535821 2C0.673892 1.76085 0.979687 1.67892 1.21883 1.81699L3.49993 3.13398V0.5C3.49993 0.223858 3.72379 0 3.99993 0Z" fill="#DC3545"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="اكتب الاجابة هنا"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="flex px-3 py-3 justify-center items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-white text-[#ADB5BD] text-right text-base font-normal leading-[130%] focus:outline-none focus:ring-2 focus:ring-[#FD7E14]"
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 w-full">
            <div className="flex flex-row-reverse justify-end items-start gap-1 w-full">
              <span className="text-[#363636] text-base font-medium leading-[120%]">
                رقم الهاتف
              </span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M3.99993 0C4.27607 0 4.49993 0.223858 4.49993 0.5V3.13398L6.78103 1.81699C7.02017 1.67892 7.32597 1.76085 7.46404 2C7.60211 2.23915 7.52017 2.54494 7.28103 2.68301L4.99993 4L7.28101 5.31699C7.52016 5.45506 7.6021 5.76085 7.46402 6C7.32595 6.23915 7.02016 6.32108 6.78101 6.18301L4.49993 4.86603V7.5C4.49993 7.77614 4.27607 8 3.99993 8C3.72379 8 3.49993 7.77614 3.49993 7.5V4.86603L1.21885 6.18301C0.979704 6.32108 0.673909 6.23915 0.535837 6C0.397766 5.76085 0.479704 5.45506 0.71885 5.31699L2.99993 4L0.718834 2.68301C0.479687 2.54494 0.39775 2.23915 0.535821 2C0.673892 1.76085 0.979687 1.67892 1.21883 1.81699L3.49993 3.13398V0.5C3.49993 0.223858 3.72379 0 3.99993 0Z" fill="#DC3545"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="01xxxxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="flex px-3 py-3 justify-center items-center gap-2.5 w-full rounded-full border border-[#DEE2E6] bg-white text-[#ADB5BD] text-right text-base font-normal leading-[130%] focus:outline-none focus:ring-2 focus:ring-[#FD7E14]"
              dir="rtl"
            />
          </div>
        </div>
      </div>
      
      <div className="flex px-6 flex-col items-end gap-4 w-full">
        <button className="flex h-10 px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full border border-[#FD7E14] hover:bg-[rgba(253,126,20,0.05)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 14H14M2 14V10.5L9 3.5L12.5 7L5.5 14H2Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#FD7E14] text-center text-base font-normal leading-[130%]">
            حفظ التغييرات
          </span>
        </button>
        <button className="flex px-4 py-1.5 justify-center items-center gap-1.5 w-full rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 7V5C13 3.67392 12.4732 2.40215 11.5355 1.46447C10.5979 0.526784 9.32608 0 8 0C6.67392 0 5.40215 0.526784 4.46447 1.46447C3.52678 2.40215 3 3.67392 3 5V7C2.20435 7 1.44129 7.31607 0.87868 7.87868C0.316071 8.44129 0 9.20435 0 10V13C0 13.7956 0.316071 14.5587 0.87868 15.1213C1.44129 15.6839 2.20435 16 3 16H13C13.7956 16 14.5587 15.6839 15.1213 15.1213C15.6839 14.5587 16 13.7956 16 13V10C16 9.20435 15.6839 8.44129 15.1213 7.87868C14.5587 7.31607 13.7956 7 13 7ZM5 5C5 4.20435 5.31607 3.44129 5.87868 2.87868C6.44129 2.31607 7.20435 2 8 2C8.79565 2 9.55871 2.31607 10.1213 2.87868C10.6839 3.44129 11 4.20435 11 5V7H5V5Z" fill="white"/>
          </svg>
          <span className="text-white text-center text-base font-normal leading-[130%]">
            تغيير كلمة السر
          </span>
        </button>
      </div>
    </div>
  );
}
