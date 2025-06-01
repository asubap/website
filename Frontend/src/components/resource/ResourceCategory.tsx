import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Image, File, Eye } from "lucide-react";
import ResourcePreviewModal from "../ui/ResourcePreviewModal";

// Define the interfaces for our data structure
interface Resource {
  id: string;
  category_id: string;
  name: string;
  description: string;
  file_key: string;
  mime_type: string;
  created_at: string;
  signed_url: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  resources: Resource[];
}

interface ResourceCategoryProps {
  category: Category;
  expanded?: boolean;
  onToggle?: () => void;
}

const ResourceCategory: React.FC<ResourceCategoryProps> = ({ category, expanded, onToggle }) => {
  // If expanded prop is provided, use it; otherwise, use internal state
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = typeof expanded === "boolean" ? expanded : internalOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resourceToPreview, setResourceToPreview] = useState<typeof category.resources[0] | null>(null);

  const handleOpenPreviewModal = (resource: typeof category.resources[0]) => {
    setResourceToPreview(resource);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setResourceToPreview(null);
  };

  // Helper function to determine icon based on mime type
  const getResourceIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image size={18} className="text-bapred" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText size={18} className="text-bapred" />;
    } else {
      return <File size={18} className="text-bapred" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Return empty string for invalid dates
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      {/* Category Header */}
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <div className="flex-1 max-w-[60%] sm:max-w-none">
          <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">
            {category.resources.length} resource{category.resources.length !== 1 ? "s" : ""}
          </span>
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-600" />
          ) : (
            <ChevronDown size={20} className="text-gray-600" />
          )}
        </div>
      </button>

      {/* Resources List (Expandable) */}
      {isOpen && (
        <div className="divide-y">
          {category.resources.map((resource) => (
            <div key={resource.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getResourceIcon(resource.mime_type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{resource.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Added {formatDate(resource.created_at)}</span>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleOpenPreviewModal(resource)}
                    className={`p-1.5 rounded-md text-gray-600 hover:bg-gray-100 ${
                      !resource.signed_url ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!resource.signed_url}
                    title={
                      !resource.signed_url ? "Preview unavailable" : "Preview Resource"
                    }
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showPreviewModal && resourceToPreview && (
        <ResourcePreviewModal
          isOpen={showPreviewModal}
          onClose={handleClosePreviewModal}
          resource={resourceToPreview}
        />
      )}
    </div>
  );
};

export default ResourceCategory; 