import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Eye,
  MoreVertical,
  Trash2,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import { toast } from "react-hot-toast";
import Modal from "../ui/Modal";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";

interface Resource {
  id: string;
  name: string;
  description: string;
  file_key: string;
  mime_type: string;
  created_at: string;
  categoryId: string;
  signed_url: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  resources: Resource[];
}

interface ResourceFormData {
  name: string;
  description: string;
  file: File | null;
  categoryId: string;
}

// List of common image MIME types for preview
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// Utility function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return "Unknown date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

const ResourceManagement: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newResource, setNewResource] = useState<ResourceFormData>({
    name: "",
    description: "",
    file: null,
    categoryId: "",
  });
  const initialCategoryStateRef = useRef(newCategory);
  const initialResourceStateRef = useRef(newResource);
  const [showConfirmCategoryClose, setShowConfirmCategoryClose] =
    useState(false);
  const [showConfirmResourceClose, setShowConfirmResourceClose] =
    useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resourceToPreview, setResourceToPreview] = useState<Resource | null>(
    null
  );
  const [imageZoomLevel, setImageZoomLevel] = useState(1);

  const fetchResources = async () => {
    console.log("Fetching resources...");
    console.log("Session:", session);
    console.log("Access token:", session?.access_token);
    console.log("Auth loading:", authLoading);

    if (authLoading) {
      console.log("Auth is still loading, waiting...");
      return;
    }

    if (!session?.access_token) {
      console.log("No access token available, stopping fetch");
      setIsLoading(false);
      return;
    }

    try {
      console.log(
        "Making API call to:",
        `${import.meta.env.VITE_BACKEND_URL}/resources`
      );
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      console.log("API response:", response);

      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();
      console.log("Received data:", data);
      setCategories(data || []); // Ensure we always have an array
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ResourceManagement mounted or session token changed");
    if (!authLoading) {
      fetchResources();
    }
  }, [session?.access_token, authLoading]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleAddCategory = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/add-category`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: newCategory.name,
            description: newCategory.description,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add category");

      toast.success("Category added successfully");
      setShowCategoryModal(false);
      setNewCategory({ name: "", description: "" });
      fetchResources();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!session?.access_token || !selectedCategory) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${
          selectedCategory.id
        }/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: newCategory.name,
            description: newCategory.description,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update category");

      toast.success("Category updated successfully");
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setNewCategory({ name: "", description: "" });
      fetchResources();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleAddResource = async () => {
    if (!session?.access_token || !selectedCategory || !newResource.file)
      return;

    try {
      const formData = new FormData();
      formData.append("name", newResource.name);
      formData.append("description", newResource.description);
      formData.append("file", newResource.file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${
          selectedCategory.id
        }/resources`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to add resource");

      toast.success("Resource added successfully");
      setShowResourceModal(false);
      setNewResource({
        name: "",
        description: "",
        file: null,
        categoryId: "",
      });
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error("Failed to add resource");
    }
  };

  const handleEditResource = async () => {
    if (
      !session?.access_token ||
      !selectedCategory ||
      !selectedResource ||
      !newResource.file
    )
      return;

    try {
      const formData = new FormData();
      formData.append("name", newResource.name);
      formData.append("description", newResource.description);
      formData.append("file", newResource.file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${
          selectedCategory.id
        }/resources/${selectedResource.id}/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update resource");

      toast.success("Resource updated successfully");
      setShowResourceModal(false);
      setSelectedResource(null);
      setNewResource({
        name: "",
        description: "",
        file: null,
        categoryId: "",
      });
      fetchResources();
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Failed to update resource");
    }
  };

  const handleDeleteResource = async (
    categoryId: string,
    resourceId: string
  ) => {
    if (
      !session?.access_token ||
      !window.confirm("Are you sure you want to delete this resource?")
    )
      return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/resources/${categoryId}/resources/${resourceId}/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete resource");

      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  // --- Functions to check for unsaved changes ---
  const hasCategoryChanges = () => {
    return (
      JSON.stringify(newCategory) !==
      JSON.stringify(initialCategoryStateRef.current)
    );
  };

  const hasResourceChanges = () => {
    // Compare name, description, and if a file has been selected (vs initially null)
    return (
      newResource.name !== initialResourceStateRef.current.name ||
      newResource.description !== initialResourceStateRef.current.description ||
      !!newResource.file !== !!initialResourceStateRef.current.file // Check if file presence changed
    );
  };

  // --- Functions to handle close attempts ---
  const handleCategoryCloseAttempt = () => {
    if (hasCategoryChanges()) {
      setShowConfirmCategoryClose(true);
    } else {
      closeAndResetCategoryModal();
    }
  };

  const handleResourceCloseAttempt = () => {
    if (hasResourceChanges()) {
      setShowConfirmResourceClose(true);
    } else {
      closeAndResetResourceModal();
    }
  };

  // --- Functions to actually close and reset modals ---
  const closeAndResetCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
    setNewCategory({ name: "", description: "" }); // Reset state
  };

  const closeAndResetResourceModal = () => {
    setShowResourceModal(false);
    setSelectedCategory(null); // Also reset selected category if relevant
    setSelectedResource(null);
    setNewResource({ name: "", description: "", file: null, categoryId: "" }); // Reset state
  };

  // --- Zoom Handlers ---
  const handleZoomIn = () => {
    setImageZoomLevel((prev) => Math.min(prev + 0.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setImageZoomLevel((prev) => Math.max(prev - 0.2, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setImageZoomLevel(1); // Reset to 1x
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Resource Management</h2>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setNewCategory({ name: "", description: "" });
            initialCategoryStateRef.current = { name: "", description: "" }; // Store initial state
            setShowCategoryModal(true);
          }}
          className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          <Plus className="inline-block mr-2" size={20} />
          Add Category
        </button>
      </div>

      {/* Conditionally render spinner or content */}
      {isLoading ? (
        <LoadingSpinner text="Loading resources..." size="md" />
      ) : (
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown size={20} className="mr-2" />
                    ) : (
                      <ChevronRight size={20} className="mr-2" />
                    )}
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setNewResource({
                          name: "",
                          description: "",
                          file: null,
                          categoryId: category.id,
                        });
                        initialResourceStateRef.current = {
                          name: "",
                          description: "",
                          file: null,
                          categoryId: category.id,
                        }; // Store initial state
                        setShowResourceModal(true);
                      }}
                      className="bg-bapred text-white px-3 py-1 rounded-md hover:bg-opacity-90"
                    >
                      Add Resource
                    </button>
                  </div>
                </div>
                {expandedCategories.has(category.id) && (
                  <div className="mt-4 pl-6">
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="space-y-2">
                      {category.resources &&
                        category.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                          >
                            <div>
                              <h3 className="font-medium">{resource.name}</h3>
                              <p className="text-sm text-gray-600">
                                {resource.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Uploaded on {formatDate(resource.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {/* Preview Icon Button */}
                              <button
                                onClick={() => {
                                  setResourceToPreview(resource);
                                  setShowPreviewModal(true);
                                }}
                                className={`p-1.5 rounded-md text-gray-600 hover:bg-gray-100 ${
                                  !resource.signed_url
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={!resource.signed_url}
                                title={
                                  !resource.signed_url
                                    ? "Preview unavailable"
                                    : "Preview Resource"
                                }
                              >
                                <Eye size={18} />
                              </button>
                              {/* Edit Icon Button */}
                              <button
                                onClick={() => {
                                  setSelectedResource(resource);
                                  setSelectedCategory(category);
                                  const currentResourceState = {
                                    name: resource.name,
                                    description: resource.description,
                                    file: null, // Reset file on edit intent
                                    categoryId: category.id,
                                  };
                                  setNewResource(currentResourceState);
                                  initialResourceStateRef.current = {
                                    ...currentResourceState,
                                  }; // Store initial state for edit
                                  setShowResourceModal(true);
                                }}
                                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                                title="Edit Resource"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {/* Delete Icon Button */}
                              <button
                                onClick={() =>
                                  handleDeleteResource(category.id, resource.id)
                                }
                                className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100"
                                title="Delete Resource"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No resource categories found. Add one to get started.
            </p>
          )}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={handleCategoryCloseAttempt}
        title={selectedCategory ? "Edit Category" : "Add Category"}
        onConfirm={selectedCategory ? handleEditCategory : handleAddCategory}
        confirmText={selectedCategory ? "Update" : "Add"}
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
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
              placeholder="Enter category name..."
              required
            />
          </div>

          {/* Category Description Input */}
          <div>
            <label
              htmlFor="categoryDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="categoryDescription"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              rows={3}
              className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
              placeholder="Enter description (optional)..."
            />
          </div>
        </div>
      </Modal>

      {/* Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={handleResourceCloseAttempt}
        title={selectedResource ? "Edit Resource" : "Add Resource"}
        onConfirm={selectedResource ? handleEditResource : handleAddResource}
        confirmText={selectedResource ? "Update" : "Add"}
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
              value={newResource.name}
              onChange={(e) =>
                setNewResource({ ...newResource, name: e.target.value })
              }
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
              value={newResource.description}
              onChange={(e) =>
                setNewResource({ ...newResource, description: e.target.value })
              }
              rows={3}
              className="block w-full px-3 py-2 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bapred focus:border-bapred"
              placeholder="Enter description (optional)..."
            />
          </div>

          {/* Resource File Input - Keeping original styling for file input button */}
          <div>
            <label
              htmlFor="resourceFile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              File <span className="text-red-500">*</span>
            </label>
            <input
              id="resourceFile"
              type="file"
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  file: e.target.files?.[0] || null,
                })
              }
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-bapred file:text-white
                hover:file:bg-opacity-90"
            />
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal && resourceToPreview && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => {
            setResourceToPreview(null);
            setImageZoomLevel(1); // Reset zoom on close
            setShowPreviewModal(false);
          }}
          title={resourceToPreview.name}
          showFooter={false} // Hide default footer, rely on X button
          size="lg" // Use a larger size for potential images
        >
          <div className="mt-4 space-y-4">
            {/* Buttons moved to top-right */}
            {resourceToPreview.signed_url && (
              <div className="flex justify-end space-x-2 mb-4">
                {/* Open in New Tab Button */}
                <a
                  href={resourceToPreview.signed_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-bapred rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
                  title="Open file in a new tab"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
                {/* Download Button */}
                <a
                  href={resourceToPreview.signed_url!}
                  download={resourceToPreview.name} // Suggest original filename for download
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  title="Download file"
                  target="_blank"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            )}

            {resourceToPreview.signed_url ? (
              <div>
                {IMAGE_MIME_TYPES.includes(resourceToPreview.mime_type) ? (
                  // Display Image with Zoom container
                  <div
                    className="overflow-auto text-center"
                    style={{ maxHeight: "65vh" }}
                  >
                    {" "}
                    {/* Container for zoom scroll */}
                    <img
                      src={resourceToPreview.signed_url}
                      alt={`Preview of ${resourceToPreview.name}`}
                      className="object-contain mx-auto block transition-transform duration-150"
                      style={{
                        transform: `scale(${imageZoomLevel})`,
                        transformOrigin: "center",
                        // Remove max-h from image itself, let container handle scroll
                      }}
                    />
                  </div>
                ) : (
                  // Attempt to display other file types in an iframe
                  <iframe
                    src={resourceToPreview.signed_url}
                    title={`Preview of ${resourceToPreview.name}`}
                    className="w-full h-[70vh] border-0"
                    // sandbox // Consider adding sandbox attribute for security if needed
                  >
                    Your browser does not support previews for this file type.
                    Use the buttons above to download or open it.
                  </iframe>
                )}
              </div>
            ) : (
              <p className="text-center text-red-600 p-4">
                Preview URL is missing for this resource.
              </p>
            )}

            {/* Zoom Controls - Only show for images */}
            {resourceToPreview.signed_url &&
              IMAGE_MIME_TYPES.includes(resourceToPreview.mime_type) && (
                <div className="flex justify-center items-center space-x-2 pt-3 mt-3 border-t border-gray-200">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    disabled={imageZoomLevel <= 0.5}
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="text-sm text-gray-700 min-w-[40px] text-center">
                    {(imageZoomLevel * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    disabled={imageZoomLevel >= 3}
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    disabled={imageZoomLevel === 1}
                    title="Reset Zoom"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              )}
          </div>
        </Modal>
      )}

      {/* Confirmation Modals for Unsaved Changes */}
      {showConfirmCategoryClose && (
        <ConfirmationModal
          isOpen={showConfirmCategoryClose}
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to discard them?"
          onConfirm={() => {
            setShowConfirmCategoryClose(false);
            closeAndResetCategoryModal(); // Proceed to close
          }}
          onClose={() => setShowConfirmCategoryClose(false)} // Handles cancel
          confirmText="Discard"
          cancelText="Cancel"
        />
      )}

      {showConfirmResourceClose && (
        <ConfirmationModal
          isOpen={showConfirmResourceClose}
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to discard them?"
          onConfirm={() => {
            setShowConfirmResourceClose(false);
            closeAndResetResourceModal(); // Proceed to close
          }}
          onClose={() => setShowConfirmResourceClose(false)} // Handles cancel
          confirmText="Discard"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default ResourceManagement;
