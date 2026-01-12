import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import type { Supervisor } from "@/hooks/useSupervisors";

interface SupervisorsTableProps {
  supervisors: Supervisor[];
  onToggleStatus?: (id: string, currentStatus: boolean) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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

export default function SupervisorsTable({ supervisors, onToggleStatus, pagination }: SupervisorsTableProps) {
  const navigate = useNavigate();

  if (supervisors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 8V14M17 11H23" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-gray-secondary text-lg">لا يوجد مشرفين</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-themeBorder bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-[30px] px-2.5 py-2.5 bg-themeBorder rounded-lg">
          <div className="flex-1 text-sm font-normal leading-[150%] text-secondary text-right">الاسم</div>
          <div className="flex-1 text-sm font-normal leading-[150%] text-secondary text-right">المنطقة</div>
          <div className="flex-1 text-sm font-normal leading-[150%] text-secondary text-right">البريد الإلكتروني</div>
          <div className="w-24 text-sm font-normal leading-[150%] text-secondary text-center">العملاء</div>
          <div className="w-24 text-sm font-normal leading-[150%] text-secondary text-center">الحالة</div>
          <div className="flex-1 text-sm font-normal leading-[150%] text-secondary text-right">تاريخ الانشاء</div>
          <div className="w-8 px-2 py-2" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-themeBorder">
          {supervisors.map((supervisor) => (
            <div
              key={supervisor.id}
              onClick={() => navigate(`/supervisors/${supervisor.id}`)}
              className="flex items-center gap-[30px] px-2.5 py-[13px] bg-white border-b border-themeBorder hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* Name */}
              <div className="flex-1 text-base font-normal leading-[130%] text-bodyText text-right">
                {supervisor.nameAr || supervisor.name}
              </div>

              {/* Region */}
              <div className="flex-1 text-base font-normal leading-[130%] text-bodyText text-right">
                {supervisor.region || '-'}
              </div>

              {/* Email */}
              <div className="flex-1 text-base font-normal leading-[130%] text-bodyText text-right">
                {supervisor.user?.email || '-'}
              </div>

              {/* Assigned Customers */}
              <div className="w-24 text-base font-bold leading-[130%] text-bodyText text-center">
                {supervisor.assignedCustomers}
              </div>

              {/* Status Toggle */}
              <div className="w-24 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus?.(supervisor.id, supervisor.isActive);
                  }}
                  className="relative w-12 h-7 rounded-full transition-colors flex items-center"
                  style={{
                    backgroundColor: supervisor.isActive ? "#FD7E14" : "#D3D3D3",
                  }}
                >
                  <span
                    className="absolute w-6 h-6 rounded-full bg-white transition-all duration-300"
                    style={{
                      left: supervisor.isActive ? "calc(100% - 1.5rem - 2px)" : "2px",
                    }}
                  />
                </button>
              </div>

              {/* Creation Date */}
              <div className="flex-1 text-base font-normal leading-[130%] text-secondary text-right">
                {formatDate(supervisor.createdAt)}
              </div>

              {/* Menu Icon */}
              <div className="flex items-start px-2 py-2">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {supervisors.map((supervisor) => (
          <div
            key={supervisor.id}
            onClick={() => navigate(`/supervisors/${supervisor.id}`)}
            className="bg-white rounded-lg border border-themeBorder p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50"
          >
            {/* Header with toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus?.(supervisor.id, supervisor.isActive);
                }}
                className="relative w-12 h-7 rounded-full transition-colors flex items-center"
                style={{
                  backgroundColor: supervisor.isActive ? "#FD7E14" : "#D3D3D3",
                }}
              >
                <span
                  className="absolute w-6 h-6 rounded-full bg-white transition-all duration-300"
                  style={{
                    left: supervisor.isActive ? "calc(100% - 1.5rem - 2px)" : "2px",
                  }}
                />
              </button>
              <span className="text-base font-medium text-bodyText">
                {supervisor.nameAr || supervisor.name}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{supervisor.user?.email || '-'}</span>
                <span className="text-gray-500 text-sm">البريد:</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{supervisor.region || '-'}</span>
                <span className="text-gray-500 text-sm">المنطقة:</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-bold">{supervisor.assignedCustomers}</span>
                <span className="text-gray-500 text-sm">العملاء:</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{formatDate(supervisor.createdAt)}</span>
                <span className="text-gray-500 text-sm">تاريخ الانشاء:</span>
              </div>
            </div>
          </div>
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
