import React from "react";
import Modal from "../ui/Modal"; // Assuming Modal is in ui

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEditing: boolean;
  categoryData: { 
    name: string; 
    description: string;
    resourceType: "firm" | "chapter";
  };
  onCategoryDataChange: (field: "name" | "description" | "resourceType", value: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEditing,
  categoryData,
  onCategoryDataChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      onConfirm={onConfirm}
      confirmText={isEditing ? "Update" : "Add"}
    >
      <div className="space-y-4">
        {/* Category Name Input */}
        <div>
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryData.name}
            onChange={(e) => onCategoryDataChange("name", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter category name..."
            required
          />
        </div>

        {/* Resource Type Dropdown */}
        <div>
          <label
            htmlFor="resourceType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Resource Type <span className="text-red-500">*</span>
          </label>
          <select
            id="resourceType"
            value={categoryData.resourceType}
            onChange={(e) => onCategoryDataChange("resourceType", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            required
          >
            <option value="">Select resource type...</option>
            <option value="firm">Firm Resource</option>
            <option value="chapter">Chapter Resource</option>
          </select>
        </div>

        {/* Category Description Input */}
        <div>
          <label
            htmlFor="categoryDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="categoryDescription"
            value={categoryData.description}
            onChange={(e) =>
              onCategoryDataChange("description", e.target.value)
            }
            rows={3}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter description (optional)..."
            required
          />
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
