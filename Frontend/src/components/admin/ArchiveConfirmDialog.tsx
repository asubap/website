import Modal from "../ui/Modal";
import { createPortal } from "react-dom";

interface ArchiveConfirmDialogProps {
  memberName: string;
  memberEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ArchiveConfirmDialog = ({
  memberName,
  memberEmail,
  onConfirm,
  onCancel,
  isLoading = false,
}: ArchiveConfirmDialogProps) => {
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
    <div onClick={(e) => e.stopPropagation()} className="archive-confirm-dialog">
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Archive Member?"
        onConfirm={handleConfirm}
        confirmText={isLoading ? "Archiving..." : "Archive Member"}
        cancelText="Cancel"
        size="sm"
        preventOutsideClick={isLoading}
        zIndex="z-[10000]"
      >
        <div className="text-gray-700">
          <p className="mb-3">
            Are you sure you want to archive{" "}
            <strong>{memberName}</strong> ({memberEmail})?
          </p>
          <p className="mb-2 text-sm font-medium">This will:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Remove them from active member lists</li>
            <li>Ban their account (they won't be able to log in)</li>
            <li>Keep their data for records (can be restored later)</li>
          </ul>
        </div>
      </Modal>
    </div>
  );

  return createPortal(content, document.body);
};

export default ArchiveConfirmDialog;
