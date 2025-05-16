import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmationModal from "../common/ConfirmationModal";
import CategoryModal from "./CategoryModal";
import ResourceModal from "./ResourceModal";
import ResourcePreviewModal from "../ui/ResourcePreviewModal";
import Fuse from "fuse.js";

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
  existingResource?: boolean; // Flag to indicate an existing resource
  existingFileName?: string; // Store the name of the existing file
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [resourceFormData, setResourceFormData] = useState<ResourceFormData>({
    name: "",
    description: "",
    file: null,
    categoryId: "",
  });
  const initialCategoryStateRef = useRef({ name: "", description: "" });
  const initialResourceStateRef = useRef<ResourceFormData>({
    name: "",
    description: "",
    file: null,
    categoryId: "",
  });
  const [showConfirmCategoryClose, setShowConfirmCategoryClose] =
    useState(false);
  const [showConfirmResourceClose, setShowConfirmResourceClose] =
    useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resourceToPreview, setResourceToPreview] = useState<Resource | null>(
    null
  );

  const fetchResources = useCallback(async () => {
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
      setCategories([]); // Reset categories on error
    } finally {
      setIsLoading(false);
    }
  }, [session, authLoading]);

  useEffect(() => {
    console.log("ResourceManagement mounted or session token changed");
    if (!authLoading) {
      fetchResources();
    }
  }, [authLoading, fetchResources]);

  // Fuzzy search logic
  const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Adjust threshold for sensitivity
    keys: [
      { name: "name", weight: 0.7 }, // Category name
      { name: "description", weight: 0.3 }, // Category description
      { name: "resources.name", weight: 0.7 }, // Resource name
      { name: "resources.description", weight: 0.5 }, // Resource description
    ],
  };

  const fuse = useMemo(() => new Fuse(categories, fuseOptions), [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories; // No query, return all
    }

    const results = fuse.search(searchQuery);

    // Map fuse results back to Category structure, filtering resources if needed
    return results
      .map((result) => {
        const category = { ...result.item }; // Get the original category item

        // If the category itself didn't score high, maybe only some resources did
        // Refine results to only include matching resources if the main category match is weak
        // Note: Fuse.js v6+ returns matches array indicating which parts matched.
        // For simplicity here, we'll show the whole category if it matches,
        // or filter resources if the category match itself isn't strong.
        // A more advanced implementation could use the `matches` array.

        // Let's refine this: If a category matches, keep all its resources for context.
        // If only resources match, we need a slightly different approach (not directly supported by simple mapping).

        // Simpler approach: Filter categories based on search, then filter resources within those categories.
        // Re-initialize fuse for resources within matched categories if needed.
        // Or, just return the category if it or any of its resources broadly match.
        return category;

        // ---- Revised Simpler Logic ----
        // Let Fuse decide which categories match based on the keys.
        // If a category appears in the results, return it as is.
        // The default Fuse behavior might already include categories where only a resource matches.
        // return result.item;
      })
      .filter(Boolean); // Filter out any potential undefined/null results if logic gets complex
  }, [searchQuery, categories, fuse]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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

  const handleOpenAddCategoryModal = () => {
    setSelectedCategory(null);
    const initialState = { name: "", description: "" };
    setCategoryFormData(initialState);
    initialCategoryStateRef.current = { ...initialState };
    setShowCategoryModal(true);
  };

  const handleOpenEditCategoryModal = (category: Category) => {
    setSelectedCategory(category);
    const initialState = {
      name: category.name,
      description: category.description,
    };
    setCategoryFormData(initialState);
    initialCategoryStateRef.current = { ...initialState };
    setShowCategoryModal(true);
  };

  const handleCategoryDataChange = (
    field: "name" | "description",
    value: string
  ) => {
    setCategoryFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCategorySubmit = async () => {
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
          body: JSON.stringify(categoryFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to add category");
      toast.success("Category added successfully");
      closeAndResetCategoryModal();
      fetchResources();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleEditCategorySubmit = async () => {
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
          body: JSON.stringify(categoryFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to update category");
      toast.success("Category updated successfully");
      closeAndResetCategoryModal();
      fetchResources();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleOpenAddResourceModal = (category: Category) => {
    setSelectedCategory(category);
    setSelectedResource(null);
    const initialState: ResourceFormData = {
      name: "",
      description: "",
      file: null,
      categoryId: category.id,
    };
    setResourceFormData(initialState);
    initialResourceStateRef.current = { ...initialState };
    setShowResourceModal(true);
  };

  const handleOpenEditResourceModal = (
    resource: Resource,
    category: Category
  ) => {
    setSelectedResource(resource);
    setSelectedCategory(category);
    const initialState: ResourceFormData = {
      name: resource.name,
      description: resource.description,
      file: null,
      categoryId: category.id,
      existingResource: true,
      existingFileName: resource.file_key
        ? resource.file_key.split("/").pop()
        : "Existing file",
    };
    setResourceFormData(initialState);
    initialResourceStateRef.current = { ...initialState, file: null };
    setShowResourceModal(true);
  };

  const handleResourceDataChange = (
    field: "name" | "description",
    value: string
  ) => {
    setResourceFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResourceFileChange = (file: File | null) => {
    setResourceFormData((prev) => ({ ...prev, file }));
  };

  const handleAddResourceSubmit = async () => {
    if (!session?.access_token || !selectedCategory || !resourceFormData.file)
      return;

    try {
      const formData = new FormData();
      formData.append("name", resourceFormData.name);
      formData.append("description", resourceFormData.description);
      formData.append("file", resourceFormData.file);

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
      closeAndResetResourceModal();
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error("Failed to add resource");
    }
  };

  const handleEditResourceSubmit = async () => {
    if (!session?.access_token || !selectedCategory || !selectedResource) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", resourceFormData.name);
      formData.append("description", resourceFormData.description);

      // Only append file if a new one was selected
      if (resourceFormData.file) {
        formData.append("file", resourceFormData.file);
      } else {
        // Explicitly indicate we want to keep the existing file
        formData.append("keepExistingFile", "true");
      }

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
      closeAndResetResourceModal();
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !session?.access_token ||
      !window.confirm(
        "Are you sure you want to delete this category? All resources in this category will also be deleted."
      )
    )
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${categoryId}/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete category");

      toast.success("Category deleted successfully");
      fetchResources();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const hasCategoryChanges = () => {
    return (
      JSON.stringify(categoryFormData) !==
      JSON.stringify(initialCategoryStateRef.current)
    );
  };

  const hasResourceChanges = () => {
    return (
      resourceFormData.name !== initialResourceStateRef.current.name ||
      resourceFormData.description !==
        initialResourceStateRef.current.description ||
      resourceFormData.file !== null // Only consider file a change if one is selected
    );
  };

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

  const closeAndResetCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
    setCategoryFormData({ name: "", description: "" });
    initialCategoryStateRef.current = { name: "", description: "" };
  };

  const closeAndResetResourceModal = () => {
    setShowResourceModal(false);
    setSelectedCategory(null);
    setSelectedResource(null);
    setResourceFormData({
      name: "",
      description: "",
      file: null,
      categoryId: "",
    });
    initialResourceStateRef.current = {
      name: "",
      description: "",
      file: null,
      categoryId: "",
    };
  };

  const handleOpenPreviewModal = (resource: Resource) => {
    setResourceToPreview(resource);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setResourceToPreview(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Resource Management</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search categories or resources..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-bapred focus:border-bapred text-sm flex-grow sm:w-64"
          />
          <button
            onClick={handleOpenAddCategoryModal}
            className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center justify-center whitespace-nowrap text-sm font-medium"
          >
            <span className="mr-1">+</span>
            <span className="hidden md:inline mr-1">Add</span>
            Category
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading resources..." size="md" />
      ) : (
        <div className="space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
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
                      onClick={() => handleOpenEditCategoryModal(category)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
                      title="Edit Category"
                    >
                      Edit Category
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 text-sm"
                      title="Delete Category"
                    >
                      Delete Category
                    </button>
                    <button
                      onClick={() => handleOpenAddResourceModal(category)}
                      className="bg-bapred text-white px-3 py-1 rounded-md hover:bg-opacity-90 text-sm"
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
                              <button
                                onClick={() => handleOpenPreviewModal(resource)}
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
                              <button
                                onClick={() =>
                                  handleOpenEditResourceModal(
                                    resource,
                                    category
                                  )
                                }
                                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                                title="Edit Resource"
                              >
                                <MoreHorizontal size={18} />
                              </button>
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
              {searchQuery
                ? "No categories or resources match your search."
                : "No resource categories found. Add one to get started."}
            </p>
          )}
        </div>
      )}

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={handleCategoryCloseAttempt}
        onConfirm={
          selectedCategory ? handleEditCategorySubmit : handleAddCategorySubmit
        }
        isEditing={!!selectedCategory}
        categoryData={categoryFormData}
        onCategoryDataChange={handleCategoryDataChange}
      />

      <ResourceModal
        isOpen={showResourceModal}
        onClose={handleResourceCloseAttempt}
        onConfirm={
          selectedResource ? handleEditResourceSubmit : handleAddResourceSubmit
        }
        isEditing={!!selectedResource}
        resourceData={resourceFormData}
        onResourceDataChange={handleResourceDataChange}
        onFileChange={handleResourceFileChange}
      />

      {showPreviewModal && resourceToPreview && (
        <ResourcePreviewModal
          isOpen={showPreviewModal}
          onClose={handleClosePreviewModal}
          resource={resourceToPreview}
        />
      )}

      {showConfirmCategoryClose && (
        <ConfirmationModal
          isOpen={showConfirmCategoryClose}
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to discard them?"
          onConfirm={() => {
            setShowConfirmCategoryClose(false);
            closeAndResetCategoryModal();
          }}
          onClose={() => setShowConfirmCategoryClose(false)}
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
            closeAndResetResourceModal();
          }}
          onClose={() => setShowConfirmResourceClose(false)}
          confirmText="Discard"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default ResourceManagement;
