import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '../../context/auth/authProvider';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';

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

const ResourceManagement: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newResource, setNewResource] = useState<ResourceFormData>({
    name: '',
    description: '',
    file: null,
    categoryId: '',
  });

  const fetchResources = async () => {
    console.log('Fetching resources...');
    console.log('Session:', session);
    console.log('Access token:', session?.access_token);
    console.log('Auth loading:', authLoading);

    if (authLoading) {
      console.log('Auth is still loading, waiting...');
      return;
    }

    if (!session?.access_token) {
      console.log('No access token available, stopping fetch');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Making API call to:', `${import.meta.env.VITE_BACKEND_URL}/resources`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resources`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      console.log('API response:', response);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        throw new Error('Failed to fetch resources');
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setCategories(data || []); // Ensure we always have an array
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('ResourceManagement mounted or session token changed');
    if (!authLoading) {
      fetchResources();
    }
  }, [session?.access_token, authLoading]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resources/add-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description
        }),
      });

      if (!response.ok) throw new Error('Failed to add category');

      toast.success('Category added successfully');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      fetchResources();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleEditCategory = async () => {
    if (!session?.access_token || !selectedCategory) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${selectedCategory.id}/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: newCategory.name,
            description: newCategory.description
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update category');

      toast.success('Category updated successfully');
      setShowCategoryModal(false);
      setSelectedCategory(null);
      setNewCategory({ name: '', description: '' });
      fetchResources();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleAddResource = async () => {
    if (!session?.access_token || !selectedCategory || !newResource.file) return;

    try {
      const formData = new FormData();
      formData.append('name', newResource.name);
      formData.append('description', newResource.description);
      formData.append('file', newResource.file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${selectedCategory.id}/resources`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to add resource');

      toast.success('Resource added successfully');
      setShowResourceModal(false);
      setNewResource({
        name: '',
        description: '',
        file: null,
        categoryId: '',
      });
      fetchResources();
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  const handleEditResource = async () => {
    if (!session?.access_token || !selectedCategory || !selectedResource || !newResource.file) return;

    try {
      const formData = new FormData();
      formData.append('name', newResource.name);
      formData.append('description', newResource.description);
      formData.append('file', newResource.file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${selectedCategory.id}/resources/${selectedResource.id}/update`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to update resource');

      toast.success('Resource updated successfully');
      setShowResourceModal(false);
      setSelectedResource(null);
      setNewResource({
        name: '',
        description: '',
        file: null,
        categoryId: '',
      });
      fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    }
  };

  const handleDeleteResource = async (categoryId: string, resourceId: string) => {
    if (!session?.access_token || !window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/resources/${categoryId}/resources/${resourceId}/delete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete resource');

      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bapred"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Resource Management</h2>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setNewCategory({ name: '', description: '' });
            setShowCategoryModal(true);
          }}
          className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          <Plus className="inline-block mr-2" size={20} />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {categories && categories.map((category) => (
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
                      name: '',
                      description: '',
                      file: null,
                      categoryId: category.id,
                    });
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
                  {category.resources && category.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <div>
                        <h3 className="font-medium">{resource.name}</h3>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {resource.signed_url ? (
                          <a
                            href={resource.signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-bapred rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bapred"
                            download={resource.file_key.split('/').pop()}
                          >
                            <Download size={16}/>
                          </a>
                        ) : (
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md cursor-not-allowed"
                            disabled
                          >
                            <Download size={16}/>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteResource(category.id, resource.id)}
                          className="p-2 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setSelectedCategory(null);
          setNewCategory({ name: '', description: '' });
        }}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        onConfirm={selectedCategory ? handleEditCategory : handleAddCategory}
        confirmText={selectedCategory ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bapred focus:ring-bapred sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bapred focus:ring-bapred sm:text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setSelectedCategory(null);
          setSelectedResource(null);
          setNewResource({
            name: '',
            description: '',
            file: null,
            categoryId: '',
          });
        }}
        title={selectedResource ? 'Edit Resource' : 'Add Resource'}
        onConfirm={selectedResource ? handleEditResource : handleAddResource}
        confirmText={selectedResource ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bapred focus:ring-bapred sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bapred focus:ring-bapred sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-bapred file:text-white
                hover:file:bg-opacity-90"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResourceManagement; 