import ConfirmDialog from "../common/ConfirmDialog";

interface DeleteConfirmationProps {
    name: string;
    userType: 'admin' | 'sponsor' | 'member';
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmation = ({ name, userType, onConfirm, onCancel }: DeleteConfirmationProps) => {
    const confirmMessage = `Are you sure you want to remove ${userType || 'member'} ${name}?`;
    
    return (
        <ConfirmDialog
            isOpen={true}
            onClose={onCancel}
            onConfirm={onConfirm}
            title="Confirm Removal"
            message={confirmMessage}
            confirmText="Remove"
            cancelText="Cancel"
        />
    );
};

export default DeleteConfirmation; 