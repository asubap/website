import React from "react";
import Modal from "../ui/Modal"; // Assuming Modal is in ui

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEditing: boolean;
  resourceData: {
    name: string;
    description: string;
    file: File | null; // Keep track if file is selected
  };
  onResourceDataChange: (field: "name" | "description", value: string) => void;
  onFileChange: (file: File | null) => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEditing,
  resourceData,
  onResourceDataChange,
  onFileChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Resource" : "Add Resource"}
      onConfirm={onConfirm}
      confirmText={isEditing ? "Update" : "Add"}
    >
      <div className="space-y-4">
        {/* Resource Name Input */}
        <div>
          <label
            htmlFor="resourceName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="resourceName"
            value={resourceData.name}
            onChange={(e) => onResourceDataChange("name", e.target.value)}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter resource name..."
            required
          />
        </div>

        {/* Resource Description Input */}
        <div>
          <label
            htmlFor="resourceDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="resourceDescription"
            value={resourceData.description}
            onChange={(e) =>
              onResourceDataChange("description", e.target.value)
            }
            rows={3}
            className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
            placeholder="Enter description (optional)..."
          />
        </div>

        {/* Resource File Input */}
        <div>
          <label
            htmlFor="resourceFile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            File <span className="text-red-500">*</span>
          </label>
          {/* Display filename if editing and file exists, otherwise show input */}
          {isEditing && resourceData.file ? (
            <p className="text-sm text-gray-600 p-2 bg-gray-100 rounded-md">
              Current file: {resourceData.file.name} (Select new file to
              replace)
            </p>
          ) : null}
          <input
            id="resourceFile"
            type="file"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-bapred file:text-white
                hover:file:bg-opacity-90"
            // Conditionally required based on if editing or adding
            // Required if adding OR if editing and no previous file exists (though backend might handle this)
            // For simplicity, let's make it always required in the UI for add/edit
            required
          />
        </div>
      </div>
    </Modal>
  );
};

export default ResourceModal;
