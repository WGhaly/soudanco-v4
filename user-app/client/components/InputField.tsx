interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col items-end gap-1.5 w-full">
      <label className="text-[#363636] text-base font-medium leading-[120%]">
        {label}
      </label>
      <input
        type={type}
        className="w-full h-[41px] px-4 py-2.5 rounded-full border border-[#DEE2E6] bg-white text-base text-right text-[#6C757D] placeholder:text-[#CED4DA] focus:outline-none focus:ring-2 focus:ring-[#FD7E14] transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        dir="rtl"
      />
    </div>
  );
}
