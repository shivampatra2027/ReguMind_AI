import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

const iconClasses = {
  success: 'text-emerald-600',
  error: 'text-red-600',
};

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) {
    return null;
  }

  const Icon = type === 'error' ? FaExclamationCircle : FaCheckCircle;

  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-md">
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${toneClasses[type] || toneClasses.success}`}
        role="status"
      >
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClasses[type] || iconClasses.success}`} />
        <p className="min-w-0 flex-1 text-sm font-medium leading-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-current opacity-70 transition hover:bg-white/70 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
