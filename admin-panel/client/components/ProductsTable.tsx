import { Link } from "react-router-dom";
import StockStatusBadge from "./StockStatusBadge";
import type { Product } from "@/hooks/useProducts";

interface ProductsTableProps {
  products: Product[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function mapStockStatus(status: string): 'in-stock' | 'out-of-stock' {
  switch (status) {
    case 'in_stock': return 'in-stock';
    case 'low_stock': return 'in-stock'; // Map low stock to in-stock for badge display
    case 'out_of_stock': return 'out-of-stock';
    default: return 'out-of-stock';
  }
}

// Generate page numbers for pagination
function getPageNumbers(page: number, totalPages: number): (number | 'dots')[] {
  const pages: (number | 'dots')[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('dots');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('dots');
    pages.push(totalPages);
  }
  return pages;
}

export default function ProductsTable({ products, pagination }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد منتجات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 self-stretch w-full">
      {/* Desktop Table */}
      <div className="hidden md:flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5">
        <div className="flex px-2.5 py-2.5 items-center gap-[30px] self-stretch rounded-lg bg-theme-border">
          <div className="flex-1 text-theme-secondary text-right text-sm font-normal leading-[150%]">
            صورة المنتج
          </div>
          <div className="flex-1 text-theme-secondary text-right text-sm font-normal leading-[150%]">
            اسم المنتج
          </div>
          <div className="flex-1 text-theme-secondary text-right text-sm font-normal leading-[150%]">
            كود المنتج
          </div>
          <div className="flex-1 text-theme-secondary text-right text-sm font-normal leading-[150%]">
            حجم العبوة
          </div>
          <div className="flex-1 text-theme-secondary text-right text-sm font-normal leading-[150%]">
            حالة المنتج
          </div>
          <div className="w-8 px-2 py-2 flex flex-col items-start gap-4 self-stretch"></div>
        </div>

        {products.map((product, index) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className={`flex px-2.5 py-[13px] items-center gap-[30px] self-stretch bg-white ${
              index !== products.length - 1 ? "border-b border-theme-border" : ""
            } hover:bg-gray-50 transition-colors`}
          >
            <div className="flex-1 flex justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr || product.name}
                  className="h-[57px] object-contain"
                />
              ) : (
                <div className="h-[57px] w-[57px] bg-gray-100 rounded flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#9CA3AF"/>
                    <path d="M21 15L16 10L5 21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex justify-end items-center gap-2.5 flex-1">
              <div className="text-body-text text-right text-base font-normal leading-[130%]">
                {product.nameAr || product.name}
              </div>
            </div>
            <div className="flex-1 text-body-text text-right text-base font-normal leading-[130%] underline">
              {product.sku}
            </div>
            <div className="flex-1 text-body-text text-right text-base font-bold leading-[150%]">
              {product.unitsPerCase} {product.unit}
            </div>
            <div className="flex-1">
              <StockStatusBadge status={mapStockStatus(product.stockStatus)} />
            </div>
            <div className="px-2 py-2 flex flex-col items-start gap-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="flex md:hidden flex-col gap-4 w-full">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="flex flex-col gap-4 p-4 rounded-lg border border-theme-border bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-4 items-start">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr || product.name}
                  className="w-20 h-20 object-contain rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#9CA3AF"/>
                    <path d="M21 15L16 10L5 21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-body-text text-right text-base font-normal leading-[130%]">
                  {product.nameAr || product.name}
                </div>
                <div className="text-theme-secondary text-right text-sm font-normal leading-[130%]">
                  {product.sku}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-body-text text-base font-bold">{product.unitsPerCase} {product.unit}</div>
                <div className="text-theme-secondary text-sm">حجم العبوة</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-32">
                  <StockStatusBadge status={mapStockStatus(product.stockStatus)} />
                </div>
                <div className="text-theme-secondary text-sm">حالة المنتج</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 self-stretch">
          <button 
            className="flex w-11 h-11 justify-center items-center p-1.5 hover:opacity-70 disabled:opacity-30"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 15L6 10L11 5" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {getPageNumbers(pagination.page, pagination.totalPages).map((pageNum, idx) => 
            pageNum === 'dots' ? (
              <span key={`dots-${idx}`} className="flex w-11 h-11 justify-center items-center text-body-text">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => pagination.onPageChange(pageNum)}
                className={`flex w-11 h-11 justify-center items-center text-base font-bold ${
                  pagination.page === pageNum ? 'text-brand-primary' : 'text-body-text hover:opacity-70'
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button 
            className="flex w-11 h-11 justify-center items-center p-1.5 hover:opacity-70 disabled:opacity-30"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L14 10L9 15" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
