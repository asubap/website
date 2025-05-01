import Modal from "../ui/Modal";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent) => void;
  onConfirm: (e?: React.MouseEvent) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  preventOutsideClick?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  preventOutsideClick = false
}: ConfirmDialogProps) => {
  useScrollLock(isOpen);

  // Wrap the onClose and onConfirm handlers with simpler versions
  const handleClose = (e?: React.MouseEvent) => {
    // Still stop propagation but don't prevent default
    if (e) {
      e.stopPropagation();
    }
    onClose(e);
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    // Still stop propagation but don't prevent default
    if (e) {
      e.stopPropagation();
    }
    onConfirm(e);
  };

  const content = (
    <div onClick={e => e.stopPropagation()} className="confirm-dialog">
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        onConfirm={handleConfirm}
        confirmText={confirmText}
        cancelText={cancelText}
        size="sm"
        preventOutsideClick={preventOutsideClick}
        zIndex="z-[10000]"
      >
        <p className="text-gray-700">{message}</p>
      </Modal>
    </div>
  );

  // Use createPortal to render the dialog directly to the document body
  return createPortal(content, document.body);
};

export default ConfirmDialog; 