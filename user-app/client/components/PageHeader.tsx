import { useNavigate, Link } from "react-router-dom";
import Logo from "./Logo";
import { useCart } from "@/hooks/useCart";

interface PageHeaderProps {
  title?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  showCart?: boolean;
}

export default function PageHeader({ title, onBack, showBackButton = true, showCart = false }: PageHeaderProps) {
  const navigate = useNavigate();
  const { data: cartData } = useCart();
  const cartItemsCount = cartData?.data?.items?.length || 0;

  return (
    <div className="relative w-full px-4 py-1.5 rounded-xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
      {/* Title - absolutely centered */}
      {title && (
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none px-28">
          <h1 className="text-[#363636] text-center text-xl font-medium leading-5 whitespace-pre-line">{title.replace(' ', '\n')}</h1>
        </div>
      )}
      
      {/* Flex container for edge elements (RTL: first=right, last=left) */}
      <div className="flex justify-between items-center w-full">
        {/* Logo + Name on the RIGHT (first in RTL) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Logo className="w-[31px] h-[51px] py-3" />
          <span className="text-[#FD7E14] text-right text-xl font-medium leading-[120%] whitespace-nowrap">سودانكو</span>
        </div>
        
        {/* Right side - Cart and/or Chevron on the LEFT */}
        <div className="flex items-center gap-2">
          {showCart && (
            <Link to="/cart" className="relative flex w-11 h-11 p-2.5 justify-center items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FD7E14] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          )}
          {showBackButton ? (
            <button
              onClick={onBack ? onBack : () => navigate(-1)}
              className="flex w-11 h-11 p-2.5 justify-center items-center"
              aria-label="رجوع"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12L15 18" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : showCart ? null : (
            <div className="w-11" />
          )}
        </div>
      </div>
    </div>
  );
}
