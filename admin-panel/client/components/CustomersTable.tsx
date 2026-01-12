import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Customer } from "@/hooks/useCustomers";

interface MenuState {
  customerId: string | null;
  position: { x: number; y: number };
}

interface CustomersTableProps {
  customers: Customer[];
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
  onDelete?: (id: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('ar-EG')} ج.م`;
}

export default function CustomersTable({ 
  customers, 
  onToggleStatus, 
  onDelete,
  pagination 
}: CustomersTableProps) {
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState<MenuState>({ customerId: null, position: { x: 0, y: 0 } });

  const handleMenuToggle = (customerId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    
    if (menuState.customerId === customerId) {
      setMenuState({ customerId: null, position: { x: 0, y: 0 } });
    } else {
      setMenuState({
        customerId,
        position: { x: rect.left, y: rect.bottom },
      });
    }
  };

  const closeMenu = () => {
    setMenuState({ customerId: null, position: { x: 0, y: 0 } });
  };

  const handleView = (id: string) => {
    navigate(`/customers/${id}`);
    closeMenu();
  };

  const handleEdit = (id: string) => {
    navigate(`/customers/${id}/edit`);
    closeMenu();
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    closeMenu();
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (onToggleStatus) {
      onToggleStatus(id, currentStatus);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { page, totalPages } = pagination;
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
  };

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد عملاء</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-6 self-stretch">
      {/* Title */}
      <h2 className="self-stretch text-gray-secondary text-right text-2xl font-medium leading-[120%]">
        جدول العملاء
      </h2>

      {/* Desktop Table */}
      <div className="hidden md:flex flex-col items-start self-stretch rounded-lg border border-theme-border bg-white p-2.5 pt-2.5 overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center gap-[30px] self-stretch rounded-lg bg-theme-border px-2.5 py-2.5 min-w-[800px]">
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">اسم العميل</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">المنطقة</div>
          <div className="flex-1 text-gray-secondary text-right font-sf text-sm font-normal">قائمة الأسعار</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">الرصيد المستحق</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">الحد الائتماني</div>
          <div className="flex-1 text-gray-secondary text-right text-sm font-normal leading-[150%]">حالة الحساب</div>
          <div className="w-8 p-2"></div>
        </div>

        {/* Table Rows */}
        {customers.map((customer, index) => {
          const isLast = index === customers.length - 1;
          const region = customer.addresses?.[0]?.city || customer.addresses?.[0]?.region || '-';
          const priceListName = customer.priceList?.nameAr || customer.priceList?.name || '-';

          return (
            <div
              key={customer.id}
              className={`flex items-center gap-[30px] self-stretch bg-white px-2.5 py-3.5 min-w-[800px] cursor-pointer hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-theme-border' : ''}`}
              onClick={() => handleView(customer.id)}
            >
              {/* Customer Name */}
              <div className="flex justify-end items-center flex-1">
                <div className="text-body-text text-right text-base font-normal leading-[130%]">
                  {customer.businessNameAr || customer.businessName}
                </div>
              </div>

              {/* Region */}
              <div className="flex-1 text-body-text text-right text-base font-normal leading-[130%]">
                {region}
              </div>

              {/* Price List */}
              <div className="flex-1 text-body-text text-right text-base font-normal leading-[130%]">
                {priceListName}
              </div>

              {/* Outstanding Balance */}
              <div className="flex-1 text-body-text text-right text-base font-bold leading-[150%]">
                {formatCurrency(customer.currentBalance)}
              </div>

              {/* Credit Limit */}
              <div className="flex-1 text-body-text text-right text-base font-bold leading-[150%]">
                {formatCurrency(customer.creditLimit)}
              </div>

              {/* Account Status Toggle */}
              <div className="flex h-[17px] flex-col justify-center items-center flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(customer.id, customer.isActive);
                  }}
                  className="relative w-8 h-[17px]"
                >
                  {customer.isActive ? (
                    <div className="relative w-8 h-[17px]">
                      <div className="absolute w-8 h-[17px] rounded-full border-2 border-brand-primary bg-brand-primary"></div>
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-white left-[17px] top-0.5"></div>
                    </div>
                  ) : (
                    <div className="relative w-8 h-[17px]">
                      <svg className="absolute w-8 h-[17px]" viewBox="0 0 37 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.7998 1C31.0465 1 35.2998 5.25329 35.2998 10.5C35.2998 15.7467 31.0465 20 25.7998 20H10.5C5.2533 20 1 15.7467 1 10.5C1 5.25329 5.2533 1 10.5 1H25.7998Z" stroke="#FD7E14" strokeWidth="2"/>
                      </svg>
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-brand-primary left-0.5 top-0.5"></div>
                    </div>
                  )}
                </button>
              </div>

              {/* Menu */}
              <div className="flex flex-col items-start p-2 relative">
                <button
                  onClick={(e) => handleMenuToggle(customer.id, e)}
                  className="flex flex-col justify-center items-center cursor-pointer hover:opacity-70"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="flex md:hidden flex-col gap-3 self-stretch">
        {customers.map((customer) => {
          const region = customer.addresses?.[0]?.city || customer.addresses?.[0]?.region || '-';
          const priceListName = customer.priceList?.nameAr || customer.priceList?.name || '-';

          return (
            <div
              key={customer.id}
              className="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]"
              onClick={() => handleView(customer.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-body-text text-sm">{customer.isActive ? 'مفعل' : 'غير مفعل'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(customer.id, customer.isActive);
                    }}
                    className="relative w-8 h-[17px]"
                  >
                    {customer.isActive ? (
                      <div className="relative w-8 h-[17px]">
                        <div className="absolute w-8 h-[17px] rounded-full border-2 border-brand-primary bg-brand-primary"></div>
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-white left-[17px] top-0.5"></div>
                      </div>
                    ) : (
                      <div className="relative w-8 h-[17px]">
                        <svg className="absolute w-8 h-[17px]" viewBox="0 0 37 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M25.7998 1C31.0465 1 35.2998 5.25329 35.2998 10.5C35.2998 15.7467 31.0465 20 25.7998 20H10.5C5.2533 20 1 15.7467 1 10.5C1 5.25329 5.2533 1 10.5 1H25.7998Z" stroke="#FD7E14" strokeWidth="2"/>
                        </svg>
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-brand-primary left-0.5 top-0.5"></div>
                      </div>
                    )}
                  </button>
                </div>
                <button onClick={(e) => handleMenuToggle(customer.id, e)} className="p-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="8" r="1.5" fill="#6C757D"/>
                    <circle cx="8" cy="13" r="1.5" fill="#6C757D"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-body-text font-bold">{customer.businessNameAr || customer.businessName}</span>
                  <span className="text-gray-secondary">الاسم:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text">{region}</span>
                  <span className="text-gray-secondary">المنطقة:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text">{priceListName}</span>
                  <span className="text-gray-secondary">قائمة الأسعار:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text font-bold">{formatCurrency(customer.currentBalance)}</span>
                  <span className="text-gray-secondary">الرصيد المستحق:</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-text font-bold">{formatCurrency(customer.creditLimit)}</span>
                  <span className="text-gray-secondary">الحد الائتماني:</span>
                </div>
              </div>
            </div>
          );
        })}
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
          
          {getPageNumbers().map((pageNum, idx) => 
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

      {/* Context Menu */}
      {menuState.customerId && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={closeMenu}
          />
          <div
            className="fixed z-20 flex flex-col items-start rounded-2xl bg-white shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] py-3"
            style={{
              left: `${menuState.position.x}px`,
              top: `${menuState.position.y + 5}px`,
            }}
          >
            <button 
              onClick={() => handleEdit(menuState.customerId!)}
              className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">تعديل</div>
            </button>
            <button 
              onClick={() => handleView(menuState.customerId!)}
              className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 text-gray-500 text-right text-base font-normal leading-[130%]">عرض</div>
            </button>
            <button 
              onClick={() => handleDelete(menuState.customerId!)}
              className="flex justify-center items-center gap-2 self-stretch px-6 py-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 text-red-500 text-right text-base font-normal leading-[130%]">حذف</div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
