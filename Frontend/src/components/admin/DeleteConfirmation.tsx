import { useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmationProps {
    email: string;
    userType: 'admin' | 'sponsor';
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmation = ({ email, userType, onConfirm, onCancel }: DeleteConfirmationProps) => {
    // Prevent body scrolling when modal is open
    useEffect(() => {
        // Save current overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Re-enable scrolling on unmount
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Create a portal to render the modal at the document body level
    return createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
            onClick={onCancel}
        >
            <div 
                className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full m-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button 
                    onClick={onCancel}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Removal</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to remove {userType === 'admin' ? 'admin' : 'sponsor'} <span className="font-semibold">{email}</span>?
                </p>
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 bg-bapred text-white rounded-md hover:bg-bapreddark transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmation; 