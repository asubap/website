import Modal from "../ui/Modal";
import { createPortal } from "react-dom";

interface RestoreConfirmDialogProps {
  memberName: string;
  memberEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RestoreConfirmDialog = ({
  memberName,
  memberEmail,
  onConfirm,
  onCancel,
  isLoading = false,
}: RestoreConfirmDialogProps) => {
  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onCancel();
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isLoading) {
      onConfirm();
    }
  };

  const content = (
    <div onClick={(e) => e.stopPropagation()} className="restore-confirm-dialog">
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Restore Member?"
        onConfirm={handleConfirm}
        confirmText={isLoading ? "Restoring..." : "Restore Member"}
        cancelText="Cancel"
        size="sm"
        preventOutsideClick={isLoading}
        zIndex="z-[10000]"
      >
        <div className="text-gray-700">
          <p className="mb-3">
            Are you sure you want to restore{" "}
            <strong>{memberName}</strong> ({memberEmail})?
          </p>
          <p className="mb-2 text-sm font-medium">This will:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Add them back to active member lists</li>
            <li>Unban their account (they will be able to log in again)</li>
            <li>Restore their previous access and permissions</li>
          </ul>
        </div>
      </Modal>
    </div>
  );

  return createPortal(content, document.body);
};

export default RestoreConfirmDialog;
