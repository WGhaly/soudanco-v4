import { useState } from "react";

interface ProductCardProps {
  image: string;
  title: string;
  subtitle: string;
  price: string;
  onAddToCart?: (quantity: number) => void;
  outOfStock?: boolean;
}

export default function ProductCard({
  image,
  title,
  subtitle,
  price,
  onAddToCart,
  outOfStock = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);

  const handleFirstAdd = () => {
    if (outOfStock) return;
    setQuantity(1);
    onAddToCart?.(1); // Add 1 item to cart
  };

  const handleIncrement = () => {
    if (outOfStock) return;
    setQuantity(prev => prev + 1);
    onAddToCart?.(1); // Add 1 more item to cart
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      // Note: We don't remove from cart here - user can do that in cart page
    } else if (quantity === 1) {
      setQuantity(0);
      // Reset display but item stays in cart until removed in cart page
    }
  };

  return (
    <div className={`flex p-2.5 flex-col justify-end items-end gap-3 rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_5px_0_rgba(0,0,0,0.1)] ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full">
        <img
          src={image}
          alt={title}
          className="h-[102px] w-full object-cover rounded-xl"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <span className="text-white text-sm font-medium px-2 py-1 bg-red-500 rounded">غير متوفر</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-0.5 w-full">
        <h3 className="text-[#212529] text-right text-xl font-medium leading-[120%] w-full">
          {title}
        </h3>
        <p className="text-[#212529] text-right text-sm font-normal leading-[150%] w-full">
          {subtitle}
        </p>
        <p className="text-[#FD7E14] text-right text-base font-bold leading-[150%] w-full">
          {price}
        </p>
      </div>

      {quantity === 0 ? (
        <button
          onClick={handleFirstAdd}
          disabled={outOfStock}
          className="flex w-8 h-8 p-2 flex-col justify-center items-center rounded-full bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_0_rgba(0,0,0,0.25)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="#6C757D" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      ) : (
        <div className="flex flex-row-reverse p-1 justify-between items-center w-full rounded-[21px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
          <button
            onClick={handleDecrement}
            className="flex w-6 h-6 p-[7px] justify-center items-center rounded-full bg-[#D3D3D3] hover:bg-[#C0C0C0] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8H12" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <span className="text-[#FD7E14] text-center text-xl font-medium leading-[120%]">
            {quantity}
          </span>
          
          <button
            onClick={handleIncrement}
            disabled={outOfStock}
            className="flex w-6 h-6 p-[7px] justify-center items-center rounded-full bg-[#FD7E14] hover:bg-[#E56D04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
