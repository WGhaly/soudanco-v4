import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StockStatusBadge from "./StockStatusBadge";
import type { Product } from "@/hooks/useProducts";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";

interface MenuState {
  productId: string | null;
  position: { x: number; y: number };
}

interface ProductsTableProps {
  products: Product[];
  onDelete?: (id: string) => void;
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

export default function ProductsTable({ products, onDelete, pagination }: ProductsTableProps) {
  const navigate = useNavigate();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [menuState, setMenuState] = useState<MenuState>({ productId: null, position: { x: 0, y: 0 } });

  const handleMenuToggle = (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    
    if (menuState.productId === productId) {
      setMenuState({ productId: null, position: { x: 0, y: 0 } });
    } else {
      setMenuState({
        productId,
        position: { x: rect.left, y: rect.bottom },
      });
    }
  };

  const closeMenu = () => {
    setMenuState({ productId: null, position: { x: 0, y: 0 } });
  };

  const handleView = (id: string) => {
    navigate(`/products/${id}`);
    closeMenu();
  };

  const handleEdit = (id: string) => {
    navigate(`/products/${id}/edit`);
    closeMenu();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct.mutate(id);
    }
    closeMenu();
  };

  const handleToggleAvailability = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    updateProduct.mutate({
      id: product.id,
      data: { isActive: !product.isActive }
    });
  };

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
          <div className="w-16 text-theme-secondary text-center text-sm font-normal leading-[150%]">
            متاح
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.isActive ? 'متاح' : 'غير متاح'}
              </span>
            </div>
            <div className="w-16 flex justify-center">
              <button
                onClick={(e) => handleToggleAvailability(e, product)}
                className={`w-10 h-5 relative rounded-full transition-colors ${
                  product.isActive ? "bg-brand-primary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                    product.isActive ? "right-0.5" : "right-[22px]"
                  }`}
                ></div>
              </button>
            </div>
            <div className="px-2 py-2 flex flex-col items-start gap-4 relative">
              <button
                onClick={(e) => handleMenuToggle(product.id, e)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                  <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                  <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
                </svg>
              </button>
              {menuState.productId === product.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeMenu}></div>
                  <div className="absolute left-0 top-full z-50 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={() => handleView(product.id)}
                      className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-end gap-2"
                    >
                      عرض
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-end gap-2"
                    >
                      تعديل
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center justify-end gap-2"
                    >
                      حذف
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </>
              )}
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.isActive ? 'متاح' : 'غير متاح'}
                </span>
                <div className="text-theme-secondary text-sm">حالة المنتج</div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => handleToggleAvailability(e, product)}
                  className={`w-10 h-5 relative rounded-full transition-colors ${
                    product.isActive ? "bg-brand-primary" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                      product.isActive ? "right-0.5" : "right-[22px]"
                    }`}
                  ></div>
                </button>
                <div className="text-theme-secondary text-sm">متاح</div>
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
