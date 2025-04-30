import React from "react";
import LoadingSpinner from "../common/LoadingSpinner"; // Adjust path as needed

interface Resource {
  id?: number | string; // Allow string or number ID
  label: string;
  url: string;
  uploadDate?: string; // Optional upload date
}

interface ResourceListProps {
  resources: Resource[];
  isLoading: boolean;
  onPreview: (resource: Resource) => void;
  onDeleteConfirm: (resource: Resource) => void; // Changed to confirm before deleting
  formatDate: (dateString: string | undefined) => string; // Pass formatDate utility
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  isLoading,
  onPreview,
  onDeleteConfirm,
  formatDate,
}) => {
  return (
    <div className="border p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Resources</h2>
      {isLoading ? (
        <LoadingSpinner text="Loading resources..." />
      ) : Array.isArray(resources) && resources.length > 0 ? (
        <div className="flex flex-col gap-3">
          {resources.map((resource) => (
            <div
              // Use URL as key if ID is missing, fallback to index if URL also missing (unlikely)
              key={resource.id || resource.url || Math.random()}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <div className="flex items-center mb-1">
                  <p className="font-medium">{resource.label}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Uploaded on {formatDate(resource.uploadDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPreview(resource)}
                  className="px-3 py-1 bg-bapred text-white rounded text-sm hover:bg-opacity-90"
                  title="View Resource"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    if (resource.url) {
                      onDeleteConfirm(resource); // Trigger confirmation dialog
                    } else {
                      console.error(
                        "Resource URL is missing, cannot initiate delete for:",
                        resource.label
                      );
                      alert("Cannot delete resource without a valid URL.");
                    }
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  title="Delete Resource"
                  disabled={!resource.url} // Disable if URL is missing
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No resources uploaded yet.</p>
      )}
    </div>
  );
};

export default ResourceList;
