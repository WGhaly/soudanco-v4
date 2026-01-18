import { useState } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import NotificationItem from "@/components/NotificationItem";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, Notification } from "@/hooks/useProfile";

export default function Notifications() {
  const [expandedGroups, setExpandedGroups] = useState({
    today: true,
    yesterday: false,
    lastWeek: false,
  });

  // Fetch notifications from API
  const { data: notificationsData, isLoading, error } = useNotifications();
  const notifications = notificationsData?.data || [];
  
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const toggleReadStatus = (id: string) => {
    markRead.mutate(id);
  };

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Group notifications by date
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (dateStr: string) => {
    const date = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const isThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    return date >= weekAgo && !isToday(dateStr) && !isYesterday(dateStr);
  };

  const todayNotifications = notifications.filter(n => isToday(n.createdAt));
  const yesterdayNotifications = notifications.filter(n => isYesterday(n.createdAt));
  const lastWeekNotifications = notifications.filter(n => isThisWeek(n.createdAt));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FD7E14]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-red-500">فشل في تحميل الإشعارات</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-end bg-[#F8F9FA] pb-24">
      <div className="w-full max-w-md bg-white">
        <div className="flex h-[50px] pt-[21px] flex-col items-end w-full bg-white">
          <div className="flex w-full flex-row-reverse justify-between items-center px-4">
            <span className="text-sm font-medium">9:41</span>
            <div className="w-[124px] h-2.5"></div>
            <div className="flex items-center gap-1.5">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H3C3.82843 0 4.5 0.671573 4.5 1.5V10.5C4.5 11.3284 3.82843 12 3 12H1.5C0.671573 12 0 11.3284 0 10.5V1.5Z" fill="black"/>
                <path d="M6 4C6 3.17157 6.67157 2.5 7.5 2.5H9C9.82843 2.5 10.5 3.17157 10.5 4V10.5C10.5 11.3284 9.82843 12 9 12H7.5C6.67157 12 6 11.3284 6 10.5V4Z" fill="black"/>
                <path d="M12 6.5C12 5.67157 12.6716 5 13.5 5H15C15.8284 5 16.5 5.67157 16.5 6.5V10.5C16.5 11.3284 15.8284 12 15 12H13.5C12.6716 12 12 11.3284 12 10.5V6.5Z" fill="black"/>
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                <path d="M0.5 6.5V4.5C0.5 2.29086 2.29086 0.5 4.5 0.5H11.5C13.7091 0.5 15.5 2.29086 15.5 4.5V6.5C15.5 8.70914 13.7091 10.5 11.5 10.5H4.5C2.29086 10.5 0.5 8.70914 0.5 6.5Z" stroke="black" strokeOpacity="0.35"/>
                <rect x="2" y="2" width="10" height="7" rx="2" fill="black"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-6 w-full max-w-md px-5 pt-5">
        <PageHeader title="الاشعارات" />

        {/* Filters Section */}
        <div className="flex flex-col items-end gap-4 w-full">
          <div className="flex flex-col items-end gap-1.5 w-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] max-sm:ml-auto">
              التاريخ
            </label>
            <div className="flex px-4 py-2.5 flex-row-reverse justify-between items-center w-full rounded-full border border-[#DEE2E6] bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 1.33334V4.00001" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.33325 1.33334V4.00001" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 6.66666H14" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#ADB5BD] text-right text-base font-normal leading-[130%]">
                (من-الي)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] max-sm:ml-auto">
              النظام
            </label>
            <div className="flex px-4 py-2.5 flex-row-reverse justify-between items-center w-full rounded-full border border-[#DEE2E6] bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5L8 11L14 5" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#ADB5BD] text-right text-sm font-normal leading-[150%]">
                يرجى الاختيار
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full">
            <label className="text-[#363636] text-right text-base font-medium leading-[120%] max-sm:ml-auto">
              حالة الاشعار
            </label>
            <div className="flex px-4 py-2.5 flex-row-reverse justify-between items-center w-full rounded-full border border-[#DEE2E6] bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5L8 11L14 5" stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="flex-1 text-[#ADB5BD] text-right text-sm font-normal leading-[150%]">
                يرجى الاختيار
              </span>
            </div>
          </div>
        </div>

        {/* Notifications Accordions - 24px spacing */}
        <div className="flex flex-col items-end w-full gap-6">
          {/* Today Section */}
          <div className="flex flex-col items-end w-full rounded-2xl">
            <button
              onClick={() => toggleGroup('today')}
              className="flex px-6 py-3 flex-row-reverse justify-end items-center gap-8 w-full rounded-t-2xl border-b border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d={expandedGroups.today ? "M2 11L8 5L14 11" : "M2 5L8 11L14 5"} stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="flex-1 text-[#6C757D] text-right text-2xl font-medium leading-[120%]">
                اليوم
              </h2>
            </button>
            
            {expandedGroups.today && (
              <div className="w-full">
                {todayNotifications.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 bg-white">لا توجد إشعارات</div>
                ) : (
                  todayNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      date={new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                      title={notif.title}
                      description={notif.message}
                      isRead={notif.isRead}
                      onToggleRead={() => toggleReadStatus(notif.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Yesterday Section */}
          <div className="flex flex-col items-end w-full rounded-2xl">
            <button
              onClick={() => toggleGroup('yesterday')}
              className="flex px-6 py-3 flex-row-reverse justify-end items-center gap-8 w-full rounded-t-2xl border-b border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d={expandedGroups.yesterday ? "M2 11L8 5L14 11" : "M2 5L8 11L14 5"} stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="flex-1 text-[#6C757D] text-right text-2xl font-medium leading-[120%]">
                الامس
              </h2>
            </button>
            
            {expandedGroups.yesterday && (
              <div className="w-full">
                {yesterdayNotifications.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 bg-white">لا توجد إشعارات</div>
                ) : (
                  yesterdayNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      date={new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                      title={notif.title}
                      description={notif.message}
                      isRead={notif.isRead}
                      onToggleRead={() => toggleReadStatus(notif.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Last Week Section */}
          <div className="flex flex-col items-end w-full rounded-2xl">
            <button
              onClick={() => toggleGroup('lastWeek')}
              className="flex px-6 py-3 flex-row-reverse justify-end items-center gap-8 w-full rounded-t-2xl border-b border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d={expandedGroups.lastWeek ? "M2 11L8 5L14 11" : "M2 5L8 11L14 5"} stroke="#ADB5BD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="flex-1 text-[#6C757D] text-right text-2xl font-medium leading-[120%]">
                الأسبوع الماضي
              </h2>
            </button>
            
            {expandedGroups.lastWeek && (
              <div className="w-full">
                {lastWeekNotifications.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 bg-white">لا توجد إشعارات</div>
                ) : (
                  lastWeekNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      date={new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                      title={notif.title}
                      description={notif.message}
                      isRead={notif.isRead}
                      onToggleRead={() => toggleReadStatus(notif.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
