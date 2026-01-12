import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FD7E14] px-4 py-20">
      <div className="flex flex-col items-center gap-5 w-full max-w-md">
        <Logo className="w-[102px] h-[111px]" />
      </div>
    </div>
  );
}
