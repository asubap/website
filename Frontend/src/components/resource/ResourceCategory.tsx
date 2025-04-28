import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Image, File, Download, ExternalLink } from "lucide-react";

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
}

const ResourceCategory: React.FC<ResourceCategoryProps> = ({ category }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
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
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <div className="flex-1">
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
                  {resource.signed_url ? (
                    <a
                      href={resource.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-bapred rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
                      download={resource.file_key.split('/').pop()}
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </a>
                  ) : (
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md cursor-not-allowed"
                      disabled
                    >
                      <ExternalLink size={16} className="mr-1" />
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCategory; 