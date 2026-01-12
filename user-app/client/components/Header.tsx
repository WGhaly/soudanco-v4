import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Header() {
  return (
    <div className="flex flex-row-reverse items-center gap-[87px] w-full px-4 py-[3px] rounded-xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
      <div className="flex flex-row-reverse items-center gap-1.5 flex-1">
        <Link 
          to="/cart" 
          className="flex p-1.5 justify-center items-center gap-2.5 rounded-lg hover:bg-[rgba(253,126,20,0.1)] transition-colors"
          title="Shopping Cart"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 3.33334H3.00526C3.85578 3.33334 4.56169 3.97375 4.6470 4.81926L5.3529 11.8475C5.43821 12.6931 6.14412 13.3333 6.99464 13.3333H14.205C14.9669 13.3333 15.6317 12.7923 15.82 12.0382L17.0699 7.20487C17.3279 6.18732 16.5947 5.16667 15.5549 5.16667H5.83333M6.66667 17.5C6.66667 18.1904 6.10702 18.75 5.41667 18.75C4.72631 18.75 4.16667 18.1904 4.16667 17.5C4.16667 16.8096 4.72631 16.25 5.41667 16.25C6.10702 16.25 6.66667 16.8096 6.66667 17.5ZM15.8333 17.5C15.8333 18.1904 15.2737 18.75 14.5833 18.75C13.893 18.75 13.3333 18.1904 13.3333 17.5C13.3333 16.8096 13.893 16.25 14.5833 16.25C15.2737 16.25 15.8333 16.8096 15.8333 17.5Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        
        <Link 
          to="/notifications" 
          className="flex p-1.5 items-center gap-2.5 rounded-lg hover:bg-[rgba(253,126,20,0.1)] transition-colors"
          title="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42112 18.2537 9.16812 18.1079C8.91513 17.9622 8.70484 17.7526 8.55833 17.5" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
      
      <div className="flex flex-row-reverse flex-1 justify-end items-center gap-4">
        <span className="text-[#FD7E14] text-right text-xl font-medium leading-[120%] max-sm:font-semibold" style={{ letterSpacing: '0' }}>
          سودانكو
        </span>
        <Link to="/home" className="hover:opacity-80 transition-opacity">
          <Logo className="w-[31px] h-[51px] py-3" />
        </Link>
      </div>
    </div>
  );
}
