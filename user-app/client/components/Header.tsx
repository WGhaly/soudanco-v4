/**
 * @deprecated This component is deprecated. Use PageHeader instead for all pages.
 * PageHeader provides consistent header layout with optional title and back button.
 */
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Header() {
  return (
    <div className="flex flex-row-reverse items-center w-full px-4 py-1.5 rounded-xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
      {/* Logo on the very right */}
      <Logo className="w-[31px] h-[51px] py-3 mr-2" />
      {/* Name (سودانكو) next to logo */}
      <span className="text-[#FD7E14] text-right text-xl font-medium leading-[120%] whitespace-nowrap mr-2">سودانكو</span>
      {/* Title centered (for Header, you may want to pass a prop for title, or leave blank) */}
      <div className="flex-1 flex justify-center items-center">
        {/* If you want a title, add it here */}
      </div>
      {/* Chevron on the very left (optional for Header) */}
    </div>
  );
}
