import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import TextLink from "@/components/TextLink";

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-end justify-center bg-[#F8F9FA] px-4 py-20 gap-[60px] relative">
      <div className="flex flex-col items-end gap-5 w-full max-w-md">
        <Logo className="w-[74px] h-[88px] py-3" />

        <div className="flex flex-col items-end gap-1.5 w-full">
          <h1 className="text-[#212529] text-right text-2xl font-medium leading-[120%]">
            مرحبًا! أنشئ حسابك
          </h1>
          <p className="text-[#6C757D] text-right text-base font-normal leading-[130%]">
            يرجى ملء البيانات التالية لإنشاء حسابك.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-6 w-full max-w-md px-[42px]">
        <InputField
          label="الاسم الاول"
          type="text"
          placeholder="اكتب اسمك الأول هنا"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <InputField
          label="الاسم الاخير"
          type="text"
          placeholder="اكتب اسم العائلة هنا"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <InputField
          label="البريد الالكتروني"
          type="email"
          placeholder="اكتب بريدك الإلكتروني هنا"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="اختر كلمة مرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center gap-2.5 w-full max-w-md px-[42px]">
        <PrimaryButton onClick={handleSignup}>إنشاء الحساب</PrimaryButton>

        <div className="flex justify-center items-center gap-2.5 w-full px-3 py-2">
          <TextLink to="/login">لديك حساب بالفعل؟ تسجيل الدخول</TextLink>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 px-4">
          <div className="flex flex-col items-end gap-1 p-4 pb-6 rounded-2xl border-b border-[#DEE2E6] bg-white shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] w-full max-w-[286px]">
            <div className="flex flex-col items-end w-full gap-3">
              <div className="flex flex-col items-end w-full">
                <div className="flex flex-row-reverse justify-between items-end w-full">
                  <div className="w-[34px]"></div>
                  <div className="flex w-6 h-6 flex-col justify-center items-center">
                    <div className="w-6 h-6 rounded-full bg-[#FD7E14] flex items-center justify-center">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="w-5 h-5"></div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 w-full">
                <div className="flex flex-row-reverse items-end gap-4 w-full">
                  <div className="flex flex-col justify-center items-center gap-2.5 flex-1">
                    <p className="text-[#07102D] text-right text-base font-normal leading-[130%] w-full">
                      مرحبًا بك في سودانكو!
                    </p>
                  </div>
                </div>
                <p className="text-[#6C757D] text-right text-base font-normal leading-[130%] w-full">
                  تم إنشاء حسابك بنجاح
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
