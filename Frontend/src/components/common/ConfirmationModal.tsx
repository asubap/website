import React from 'react';
import ConfirmDialog from './ConfirmDialog';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void; // Called when Cancel or backdrop is clicked
  onConfirm: () => void; // Called when Confirm is clicked
  title: string;
  message: string;
  confirmText?: string; // Optional override for confirm button text
  cancelText?: string;  // Optional override for cancel button text
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = (props) => {
  return <ConfirmDialog {...props} />;
};

export default ConfirmationModal; 