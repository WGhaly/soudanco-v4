interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6 rounded-2xl border-b border-theme-border bg-white shadow-[0_5px_15px_0_rgba(0,0,0,0.15)] px-4 py-9 w-[286px]">
        <div className="flex flex-col items-start gap-4 self-stretch">
          <div className="flex flex-col items-start gap-1.5 self-stretch">
            <div className="flex justify-between items-start self-stretch">
              <div className="w-[34px]"></div>
              <div className="flex flex-col justify-center items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="#FD7E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="w-5 h-5"></div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1.5 self-stretch">
            <div className="flex items-start gap-4 self-stretch">
              <div className="flex flex-col justify-center items-center gap-2.5 flex-1 self-stretch">
                <div className="self-stretch text-text-primary text-center text-base font-normal leading-[130%]">
                  هل تريد تأكيد تسجيل الخروج؟
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch">
          <button
            onClick={onClose}
            className="flex justify-center items-center gap-1.5 flex-1 rounded-full bg-brand-primary px-4 py-1.5 transition-opacity hover:opacity-90"
          >
            <span className="text-white text-center text-base font-normal leading-[130%]">لا</span>
          </button>
          <button
            onClick={onConfirm}
            className="flex justify-center items-center gap-1.5 flex-1 rounded-full border border-brand-primary px-4 py-1.5 transition-colors hover:bg-brand-primary/5"
          >
            <span className="text-brand-primary text-center text-base font-normal leading-[130%]">نعم</span>
          </button>
        </div>
      </div>
    </>
  );
}
