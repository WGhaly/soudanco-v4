import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import TextLink from "@/components/TextLink";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/home");
      } else {
        setError(result.error || "فشل تسجيل الدخول");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-end justify-center bg-[#F8F9FA] px-4 py-20 gap-[60px]">
      <div className="flex flex-col items-end gap-5 w-full max-w-md">
        <Logo className="w-[74px] h-[88px] py-3" />

        <div className="flex flex-col items-end gap-1.5 w-full">
          <h1 className="text-[#212529] text-right text-2xl font-medium leading-[120%]">
            مرحبًا بعودتك
          </h1>
          <p className="text-[#6C757D] text-right text-base font-normal leading-[130%]">
            يرجى تسجيل الدخول للوصول إلى حسابك.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-6 w-full max-w-md px-[42px]">
        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-right text-sm">{error}</p>
          </div>
        )}
        
        <InputField
          label="البريد الالكتروني"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center gap-2.5 w-full max-w-md px-[42px]">
        <PrimaryButton onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </PrimaryButton>

        <div className="flex justify-center items-center gap-2.5 w-full px-3 py-2">
          <TextLink to="/signup">ليس لديك حساب؟ سجل هنا</TextLink>
        </div>
      </div>
    </div>
  );
}
