interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-3.5 rounded-full bg-[#FD7E14] text-white text-center text-base font-normal leading-[130%] shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] hover:bg-[#E66E0A] active:bg-[#D66000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
