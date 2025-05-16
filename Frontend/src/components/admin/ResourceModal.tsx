import React from "react";
import Modal from "../ui/Modal";
import { FileText } from "lucide-react";

interface ResourceData {
  name: string;
  description: string;
  file: File | null;
  categoryId: string;
  existingResource?: boolean;
  existingFileName?: string;
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEditing: boolean;
  resourceData: ResourceData;
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onResourceDataChange("name", e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onResourceDataChange("description", e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    onFileChange(file);
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileChange(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Resource" : "Add Resource"}
      confirmText={isEditing ? "Save Changes" : "Add Resource"}
      onConfirm={onConfirm}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="resourceName" className="block mb-1 text-sm font-medium text-gray-700">
            Resource Name <span className="text-red-500">*</span>
          </label>
          <input
            id="resourceName"
            type="text"
            value={resourceData.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-bapred focus:border-bapred"
            placeholder="Enter resource name"
            required
          />
        </div>

        <div>
          <label htmlFor="resourceDescription" className="block mb-1 text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="resourceDescription"
            value={resourceData.description}
            onChange={handleDescriptionChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-bapred focus:border-bapred"
            placeholder="Enter resource description"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {isEditing ? "Replace File" : "File"} {isEditing ? "" : <span className="text-red-500">*</span>}
          </label>
          
          {/* Show existing file information when editing */}
          {isEditing && resourceData.existingResource && (
            <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center">
              <FileText size={18} className="text-gray-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{resourceData.existingFileName || "Existing file"}</p>
                <p className="text-xs text-gray-500">Current file will be kept if no new file is selected</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-bapred file:text-white hover:file:bg-opacity-90"
              required={!isEditing} // Required only for new resources
            />
            {resourceData.file && (
              <button
                onClick={clearFile}
                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                type="button"
              >
                Clear
              </button>
            )}
          </div>
          {resourceData.file && (
            <p className="text-sm text-gray-500 mt-1">Selected: {resourceData.file.name}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ResourceModal;
