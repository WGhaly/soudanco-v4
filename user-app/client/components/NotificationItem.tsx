interface NotificationItemProps {
  date: string;
  title: string;
  description: string;
  isRead: boolean;
  onToggleRead: () => void;
}

export default function NotificationItem({
  date,
  title,
  description,
  isRead,
  onToggleRead,
}: NotificationItemProps) {
  return (
    <div className="flex px-3 pr-4 py-4 flex-row-reverse justify-end items-start gap-3 border-b border-[#DEE2E6] bg-white">
      <div className="flex flex-row-reverse items-start gap-4 flex-1">
        <div className="flex flex-col justify-center items-end gap-3 flex-1">
          <div className="flex flex-row-reverse justify-center items-center gap-2.5 w-full">
            <span className="text-[#ADB5BD] text-right text-sm font-normal leading-[150%]">
              {date}
            </span>
            <span className="flex-1 text-[#07102D] text-right text-base font-normal leading-[130%]">
              {title}
            </span>
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
              <circle cx="3" cy="3" r="3" fill={isRead ? "#DEE2E6" : "#FD7E14"} />
            </svg>
          </div>

          <p className="text-[#7C7C7C] text-right text-sm font-normal leading-[150%] w-full">
            {description}
          </p>

          <div className="flex flex-row-reverse justify-end items-start gap-3 w-full">
            <button
              onClick={onToggleRead}
              className="text-[#FD7E14] text-base font-normal leading-[130%] hover:underline"
            >
              {isRead ? "تحديد كغير مقروء" : "تحديد كمقروء"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
