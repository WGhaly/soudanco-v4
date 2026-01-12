import { cn } from "@/lib/utils";

export type StockStatus = "in-stock" | "out-of-stock";

interface StockStatusBadgeProps {
  status: StockStatus;
}

export default function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const statusStyles: Record<
    StockStatus,
    { bg: string; border: string; text: string; label: string }
  > = {
    "in-stock": {
      bg: "bg-green-200",
      border: "border-theme-success",
      text: "text-white",
      label: "متوفر",
    },
    "out-of-stock": {
      bg: "bg-red-300",
      border: "border-theme-danger",
      text: "text-white",
      label: "غير متوفر",
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={cn(
        "flex px-3 py-1 justify-center items-center flex-1 rounded-full border",
        style.bg,
        style.border
      )}
    >
      <span className={cn("flex-1 text-center text-sm font-normal leading-[150%]", style.text)}>
        {style.label}
      </span>
    </div>
  );
}
