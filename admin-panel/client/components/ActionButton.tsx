import { useNavigate } from "react-router-dom";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
}

export default function ActionButton({ label, onClick, href }: ActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex justify-center items-center gap-1.5 flex-1 rounded-full bg-brand-primary px-4 py-1.5 transition-opacity hover:opacity-90"
    >
      <span className="text-white text-center text-base font-normal leading-[130%]">{label}</span>
      <div className="flex flex-col justify-center items-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4.16666V15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.16667 10H15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}
