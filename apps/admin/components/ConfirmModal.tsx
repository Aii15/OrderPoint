'use client';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[2.5rem] border border-latte/10 bg-white p-8 text-center shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 font-serif text-2xl text-ink">{title}</h3>
        <p className="mb-8 text-[15px] text-ink/60">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full bg-cream px-6 py-3 text-[15px] font-semibold text-ink/70 transition active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full px-6 py-3 text-[15px] font-semibold text-cream transition active:scale-95 ${
              danger ? 'bg-red-500' : 'bg-latte'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}