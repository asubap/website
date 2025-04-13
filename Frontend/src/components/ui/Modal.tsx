// Components/ui/Modal.tsx
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveButtonText?: string;
  checkUnsavedChanges?: () => boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveButtonText = "Save Changes",
  checkUnsavedChanges = () => false,
}) => {
  const [showUnsavedChangesConfirmation, setShowUnsavedChangesConfirmation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose('outside');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = (trigger: 'x' | 'outside') => {
    if (checkUnsavedChanges()) {
      setShowUnsavedChangesConfirmation(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button 
            onClick={() => handleClose('x')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        {children}
        
        {onSave && (
          <div className="flex justify-end gap-3 pt-2 border-t mt-6">
            <button 
              onClick={onClose}
              className="px-5 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              className="px-5 py-2 bg-bapred text-white rounded-md hover:bg-red-700"
            >
              {saveButtonText}
            </button>
          </div>
        )}

        {showUnsavedChangesConfirmation && (
          <ConfirmationDialog
            title="Unsaved Changes"
            message="You have unsaved changes. Are you sure you want to close without saving?"
            confirmText="Discard Changes"
            cancelText="Continue Editing"
            onConfirm={() => { setShowUnsavedChangesConfirmation(false); onClose(); }}
            onCancel={() => setShowUnsavedChangesConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
};

// Reusable confirmation dialog component
interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}