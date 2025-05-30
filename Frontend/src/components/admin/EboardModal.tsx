import React from "react";
import Modal from "../ui/Modal"; // Assuming Modal is in ui

interface EboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEditing: boolean;
  eboardData: { 
    image: string;
    name: string;
    role: string;
    email: string;
    major: string;
    location: string;
  };
  onEboardDataChange: (field: "image" | "name" | "role" | "email" | "major" | "location", value: string) => void;
}

const EboardModal: React.FC<EboardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEditing,
  eboardData,
  onEboardDataChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Eboard Member" : "Add Eboard Member"}
      onConfirm={onConfirm}
      confirmText={isEditing ? "Update" : "Add"}
    >
      <div className="space-y-4">
        {/* Image Input */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="image"
            value={eboardData.image}
            onChange={(e) => onEboardDataChange("image", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter image URL..."
            required
          />
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={eboardData.name}
            onChange={(e) => onEboardDataChange("name", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            required
          />
        </div>

        {/* Role Input */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role <span className="text-red-500">*</span>
          </label>
          <textarea
            id="role"
            value={eboardData.role}
            onChange={(e) =>
              onEboardDataChange("role", e.target.value)
            }
            rows={3}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter role..."
            required
          />
        </div>
      </div>
    </Modal>
  );
};

export default EboardModal;
