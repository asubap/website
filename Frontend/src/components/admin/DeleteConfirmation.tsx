import ConfirmDialog from "../common/ConfirmDialog";

interface DeleteConfirmationProps {
    email: string;
    userType: 'admin' | 'sponsor';
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmation = ({ email, userType, onConfirm, onCancel }: DeleteConfirmationProps) => {
    const confirmMessage = `Are you sure you want to remove ${userType === 'admin' ? 'admin' : 'sponsor'} ${email}?`;
    
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