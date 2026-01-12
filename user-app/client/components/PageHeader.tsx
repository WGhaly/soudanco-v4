import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-row-reverse items-center gap-4 w-full px-4 py-1.5 rounded-xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
      <button
        onClick={handleBack}
        className="flex w-11 h-11 p-2.5 justify-center items-center"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.6771 19.8576L8.36108 12.5417L15.6771 5.22569"
            stroke="#DEE2E6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex flex-1 justify-center items-center max-sm:my-auto">
        <h1 className="text-[#363636] text-center text-xl font-medium leading-5">
          {title}
        </h1>
      </div>
    </div>
  );
}
