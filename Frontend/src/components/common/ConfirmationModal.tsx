import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void; // Called when Cancel or backdrop is clicked
  onConfirm: () => void; // Called when Confirm is clicked
  title: string;
  message: string;
  confirmText?: string; // Optional override for confirm button text
  cancelText?: string;  // Optional override for cancel button text
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  // Prevent body scrolling when modal is open
  React.useEffect(() => {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
          document.body.style.overflow = originalStyle;
      };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full m-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close button (optional, but good practice) */}
        <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            // Example using bapred for confirm, adjust as needed
            className="px-4 py-2 bg-bapred text-white text-sm rounded-md hover:bg-bapreddark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal; 