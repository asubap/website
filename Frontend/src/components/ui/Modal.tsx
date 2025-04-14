import React, { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  showFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (e?: React.MouseEvent) => void;
  hasUnsavedChanges?: boolean | (() => boolean);
  preventOutsideClick?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  transparentBg?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showFooter = true,
  confirmText = "Save Changes",
  cancelText = "Cancel",
  onConfirm,
  hasUnsavedChanges = false,
  preventOutsideClick = false,
  size = "md",
  transparentBg = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showUnsavedChangesConfirmation, setShowUnsavedChangesConfirmation] = useState(false);
  const [setCloseTrigger] = useState<'x' | 'outside' | 'button' | 'keyboard' | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (preventOutsideClick) return;
       
      // Check if we have an active unsaved changes confirmation
      if (showUnsavedChangesConfirmation) return;
      
      // Check if the target is a modal or inside one of our modals
      const target = event.target as HTMLElement;
      if (target.closest('.modal-content') || target.closest('.confirm-dialog')) {
        return;
      }
      
      // Make sure the click is outside the modal
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        console.log("Outside click detected - checking for unsaved changes");
        
        // Force immediate evaluation of unsaved changes when outside click happens
        if (typeof hasUnsavedChanges === 'function') {
          // Call the function to get direct changes right now
          const changes = hasUnsavedChanges();
          console.log("Outside click - direct check for changes:", changes);
          
          if (changes) {
            setCloseTrigger('outside');
            setShowUnsavedChangesConfirmation(true);
            return;
          }
        } else if (hasUnsavedChanges) {
          // If it's a boolean value and true
          setCloseTrigger('outside');
          setShowUnsavedChangesConfirmation(true);
          return;
        }
        
        // If no changes, close normally
        onClose(event as unknown as React.MouseEvent);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose('keyboard', undefined);
      }
    };

    if (isOpen) {
      // Use mousedown for better responsiveness
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, preventOutsideClick, showUnsavedChangesConfirmation]);

  const handleClose = (trigger: 'x' | 'outside' | 'button' | 'keyboard', e?: React.MouseEvent) => {
    console.log("Modal close attempt via:", trigger);
    
    // Always evaluate the hasUnsavedChanges function to get the current state
    const checkUnsavedChanges = () => {
      if (typeof hasUnsavedChanges === 'function') {
        // Call the function to get the latest value
        return hasUnsavedChanges();
      }
      // Otherwise use the boolean value directly
      return hasUnsavedChanges;
    };
    
    const unsavedChanges = checkUnsavedChanges();
    
    console.log("Has unsaved changes:", unsavedChanges);
    console.log("hasUnsavedChanges type:", typeof hasUnsavedChanges);
    
    if (unsavedChanges) {
      setCloseTrigger(trigger);
      setShowUnsavedChangesConfirmation(true);
    } else {
      onClose(e);
    }
  };

  const confirmClose = (e?: React.MouseEvent) => {
    setShowUnsavedChangesConfirmation(false);
    onClose(e);
  };

  const cancelClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowUnsavedChangesConfirmation(false);
    setCloseTrigger(null);
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  const modalContent = (
    <div className={`fixed inset-0 ${transparentBg ? '' : 'bg-black bg-opacity-50'} flex items-center justify-center z-[9999]`}>
      <div 
        ref={modalRef} 
        className={`modal-content bg-white p-6 rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto relative`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button 
            onClick={(e) => handleClose('x', e)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="mb-6">{children}</div>
        
        {showFooter && (
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button 
              onClick={(e) => handleClose('button', e)}
              className="px-5 py-2 border rounded-md hover:bg-gray-50"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button 
                onClick={(e) => onConfirm(e)}
                className="px-5 py-2 bg-bapred text-white rounded-md hover:bg-red-700"
              >
                {confirmText}
              </button>
            )}
          </div>
        )}

        {/* Unsaved Changes Confirmation */}
        {showUnsavedChangesConfirmation && (
          <div className={`fixed inset-0 ${transparentBg ? '' : 'bg-black bg-opacity-50'} flex items-center justify-center z-[10000]`}>
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Unsaved Changes</h3>
              <p className="mb-6">You have unsaved changes. Are you sure you want to close without saving?</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={(e) => cancelClose(e)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Continue Editing
                </button>
                <button 
                  onClick={(e) => confirmClose(e)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
