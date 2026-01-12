import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex px-8 flex-col items-end gap-2.5 w-full">
      <div className="flex flex-row-reverse p-1.5 py-[5px] justify-between items-start w-full rounded-xl bg-white shadow-[0_5px_15px_0_rgba(0,0,0,0.15)]">
        <Link
          to="/account"
          className={`flex p-[11px] flex-col justify-center items-center flex-1 rounded-[10px] ${
            isActive("/account") ? "bg-[rgba(253,126,20,0.1)]" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="5" r="4" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17.5C2 15.2909 5.58172 13.3333 10 13.3333C14.4183 13.3333 18 15.2909 18 17.5V20H2V17.5Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        
        <Link
          to="/orders"
          className={`flex p-[11px] flex-col justify-center items-center flex-1 rounded-[10px] ${
            isActive("/orders") || isActive("/order-detail") ? "bg-[rgba(253,126,20,0.1)]" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3.33333 2.5H0.833333V20H19.1667V2.5H16.6667M3.33333 2.5V0H16.6667V2.5M3.33333 2.5H16.6667M13.3333 8.33333H6.66667V10.8333H13.3333V8.33333Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        
        <Link
          to="/products"
          className={`flex p-[11px] flex-col justify-center items-center flex-1 rounded-[10px] ${
            isActive("/products") ? "bg-[rgba(253,126,20,0.1)]" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.3333 5.83333L10 0.833333L1.66667 5.83333M18.3333 5.83333L10 10.8333M18.3333 5.83333V14.1667L10 19.1667M1.66667 5.83333L10 10.8333M1.66667 5.83333V14.1667L10 19.1667M10 10.8333V19.1667" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        
        <Link
          to="/home"
          className={`flex p-[11px] flex-col justify-center items-center flex-1 rounded-[10px] ${
            isActive("/home") ? "bg-[rgba(253,126,20,0.1)]" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 18.3333V10H12.5V18.3333" stroke="#FD7E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
