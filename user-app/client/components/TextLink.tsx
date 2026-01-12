import { Link } from "react-router-dom";

interface TextLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export default function TextLink({ to, children, className = "" }: TextLinkProps) {
  return (
    <Link
      to={to}
      className={`text-[#6C757D] text-center text-base font-normal leading-[130%] hover:text-[#FD7E14] transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}
