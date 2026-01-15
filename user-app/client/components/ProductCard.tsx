import { useState } from "react";

interface ProductCardProps {
  image: string;
  title: string;
  subtitle: string;
  price: string;
  onAddToCart?: (quantity: number) => void;
  outOfStock?: boolean;
  highlightOutOfStock?: boolean;
}

export default function ProductCard({
  image,
  title,
  subtitle,
  price,
  onAddToCart,
  outOfStock = false,
  ...rest
}: ProductCardProps) {
  const { highlightOutOfStock = false } = rest;
  const [quantity, setQuantity] = useState(0);
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [inputQuantity, setInputQuantity] = useState("");

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

  const handleQuantityClick = () => {
    setInputQuantity(quantity.toString());
    setShowQuantityPopup(true);
  };

  const handlePopupSubmit = () => {
    const newQuantity = parseInt(inputQuantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      setShowQuantityPopup(false);
      return;
    }
    
    const difference = newQuantity - quantity;
    if (difference > 0) {
      // Adding more items
      onAddToCart?.(difference);
    }
    // Note: If reducing, the cart page handles removal
    setQuantity(newQuantity);
    setShowQuantityPopup(false);
  };

  const handlePopupClose = () => {
    setShowQuantityPopup(false);
    setInputQuantity("");
  };

  return (
    <>
      <div className={`flex px-2.5 pt-2.5 pb-2 flex-col justify-end items-end gap-3 rounded-xl border border-[#DEE2E6] bg-white shadow-[0_0_5px_0_rgba(0,0,0,0.1)] ${outOfStock ? 'opacity-60' : ''}`} style={{ minHeight: 260 }}>
        <div className="relative w-full" style={{ aspectRatio: '1.6/1', height: '120px', minHeight: '120px', maxHeight: '120px' }}>
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover rounded-xl ${highlightOutOfStock ? 'grayscale-[60%] brightness-95' : ''}`}
            style={{ aspectRatio: '1.6/1', height: '120px', minHeight: '120px', maxHeight: '120px' }}
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
              <span className={`text-sm font-medium px-4 py-2 rounded-full ${highlightOutOfStock ? 'bg-[#FD7E14] text-white' : 'bg-red-500 text-white'}`}>غير متوفر</span>
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

        {/* Always show quantity controls */}
        <div className="flex flex-row p-1 justify-between items-center w-full rounded-[21px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.2)]">
          {/* Minus button on the left */}
          <button
            onClick={handleDecrement}
            disabled={outOfStock || quantity === 0}
            className="flex w-6 h-6 p-[7px] justify-center items-center rounded-full bg-[#D3D3D3] hover:bg-[#C0C0C0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8H12" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* Quantity - clickable to open popup */}
          <button
            onClick={handleQuantityClick}
            className="text-[#FD7E14] text-center text-xl font-medium leading-[120%] hover:underline cursor-pointer bg-transparent border-none"
          >
            {quantity}
          </button>
          
          {/* Plus button on the right */}
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
      </div>

      {/* Quantity Input Popup */}
      {showQuantityPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div 
            className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h3 className="text-xl font-bold text-[#212529] mb-4 text-right">أدخل الكمية</h3>
            <input
              type="number"
              min="1"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePopupSubmit();
                if (e.key === 'Escape') handlePopupClose();
              }}
              autoFocus
              className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-[#FD7E14] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD7E14]/50 mb-4"
              placeholder="1"
            />
            <div className="flex gap-3">
              <button
                onClick={handlePopupClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handlePopupSubmit}
                className="flex-1 px-4 py-2.5 bg-[#FD7E14] text-white rounded-xl hover:bg-[#E56D04] transition-colors font-medium"
              >
                أضف للسلة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
