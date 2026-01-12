interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-start gap-1 flex-1 rounded-2xl bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] p-3">
      <div className="self-stretch text-gray-secondary text-right text-base font-normal leading-[130%]">
        {title}
      </div>
      <div className="self-stretch text-body-text text-right text-xl font-medium leading-[120%]">
        {value}
      </div>
    </div>
  );
}
