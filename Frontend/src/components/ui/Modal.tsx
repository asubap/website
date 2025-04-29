import React from 'react';
import { X } from 'lucide-react';

{/*Resource Management Modal*/}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  size?: 'sm' | 'md' | 'lg';
  preventOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showFooter = true,
  size = 'md',
  preventOutsideClick = false
}) => {
  if (!isOpen) return null;

  const handleBackgroundClick = () => {
    if (!preventOutsideClick) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'sm:max-w-lg',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleBackgroundClick}
        />

        {/* Modal panel */}
        <div className={`inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]} sm:align-middle`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-4">{children}</div>
              </div>
            </div>
          </div>
          {showFooter && (
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-bapred px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-bapred focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {confirmText}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bapred focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {cancelText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
