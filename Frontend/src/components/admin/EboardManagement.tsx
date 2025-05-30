import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
  } from "react";
  import {
    MoreHorizontal,
    Trash2,
  } from "lucide-react";
  import { useAuth } from "../../context/auth/authProvider";
  import { toast } from "react-hot-toast";
  import LoadingSpinner from "../common/LoadingSpinner";
  import EboardModal from "./EboardModal";
  import Fuse from "fuse.js";
  import SearchInput from "../common/SearchInput";
  
  type EboardFacultyEntry = {
    id: string;
    image: string;
    name: string;
    role: string;
    email: string;
    major: string; // Assuming 'major' can also store 'Accountancy & Business Law '25' or 'Faculty Advisor' details
    location: string;
  };
  
  const EboardManagement: React.FC = () => {
    const { session, loading: authLoading } = useAuth();
    const [entries, setEntries] = useState<EboardFacultyEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<EboardFacultyEntry | null>(null);
    const [showEboardModal, setShowEboardModal] = useState(false);
    const initialEntryStateRef = useRef({
      name: "",
    });
    const [eboardFormData, setEboardFormData] = useState<EboardFacultyEntry>({
      id: "",
      image: "",
      name: "",
      role: "",
      email: "",
      major: "",
      location: "",
    });
    const [showConfirmEboardClose, setShowConfirmEboardClose] = useState(false);
    

    const setEntryFormData = useCallback((data: EboardFacultyEntry) => {
      setSelectedEntry(data);
    }, []);
  
    const fetchResources = useCallback(async () => {
      if (authLoading) {
        return;
      }
  
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/eboard`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
  
        if (!response.ok) {
          console.error("API error:", response.status, response.statusText);
          throw new Error("Failed to fetch resources");
        }
  
        const data = await response.json(); // Use defined type

        // add id to each entry
        const entriesWithIds = data.map((entry: EboardFacultyEntry) => ({
          ...entry,
          id: entry.id || crypto.randomUUID(),
        }));
        
        setEntries(entriesWithIds);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Failed to load resources");
        setEntries([]); // Reset categories on error
      } finally {
        setIsLoading(false);
      }
    }, [session, authLoading]);
  
    useEffect(() => {
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
      ],
    };
  
    const fuse = useMemo(() => new Fuse(entries, fuseOptions), [entries]);
  
    const filteredEntries = useMemo(() => {
      if (!searchQuery.trim()) {
        return entries; // No query, return all
      }
  
      const results = fuse.search(searchQuery);
  
      // Map fuse results back to Category structure, filtering resources if needed
      return results
        .map((result) => {
          const category = { ...result.item }; // Get the original category item
          return category;
        })
        .filter(Boolean); // Filter out any potential undefined/null results if logic gets complex
    }, [searchQuery, entries, fuse]);
  
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    };
  
    const handleOpenAddEntryModal = () => {
      setSelectedEntry(null);

      const initialState: EboardFacultyEntry = {
        id: "",
        image: "",
        name: "",
        role: "",
        email: "",
        major: "",
        location: "",
      };
      setEntryFormData(initialState);
      initialEntryStateRef.current = { ...initialState };
      setShowEboardModal(true);
    };

    const handleOpenEditEntryModal = (entry: EboardFacultyEntry) => {
      setSelectedEntry(entry);
      setShowEboardModal(true);
    };

    const handleEboardDataChange = (field: keyof EboardFacultyEntry, value: string) => {
      setEboardFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddEntrySubmit = async () => {
      if (!session?.access_token) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/eboard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(eboardFormData),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add eboard member");
        }
        toast.success("Eboard member added successfully");
        closeAndResetEboardModal();
        fetchResources();
      } catch (error) {
        console.error("Error adding eboard member:", error);
        toast.error("Failed to add eboard member");
      }
    };

    const handleEditEntrySubmit = async () => {
      if (!session?.access_token || !selectedEntry) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/eboard/${selectedEntry.id}/update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(eboardFormData),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update eboard member");
        }
        toast.success("Eboard member updated successfully");
        closeAndResetEboardModal();
        fetchResources();
      } catch (error) {
        console.error("Error updating eboard member:", error);
        toast.error("Failed to update eboard member");
      }
    };

    const handleDeleteEntry = (id: string) => {
      console.log("Deleting entry with id:", id);
    };

    const hasEboardChanges = () => {
        return (
          JSON.stringify(eboardFormData) !==
          JSON.stringify(initialEntryStateRef.current)
        );
      };

    const handleEboardCloseAttempt = () => {
        if (hasEboardChanges()) {
        setShowConfirmEboardClose(true);
        } else {
        closeAndResetEboardModal();
        }
    };

    const closeAndResetEboardModal = () => {
        setShowEboardModal(false);
        setSelectedEntry(null);
        // setEntryFormData({
        //   image: "",
        //   name: "",
        //   role: "",
        //   email: "",
        //   major: "",
        //   location: "",
        // });
        // initialEntryStateRef.current = {
        //   image: "",
        //   name: "",
        //   role: "",
        //   email: "",
        //   major: "",
        //   location: "",
        // };
      };
  
    return (
      <div>
        <div className="mb-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Eboard Management</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search eboard members..."
              containerClassName="flex-grow sm:w-64"
              inputClassName="px-3 py-2"
            />
            <button
              onClick={handleOpenAddEntryModal}
              className="bg-bapred text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center justify-center whitespace-nowrap text-sm font-medium"
            >
              <span className="mr-1">+</span>
              <span className="hidden md:inline mr-1">Add</span>
              Eboard Member
            </button>
          </div>
        </div>
  
        {isLoading ? (
          <LoadingSpinner text="Loading eboard members..." size="md" />
        ) : (
          <div className="space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center cursor-pointer mr-4"
                    //   onClick={() => toggleEntry(entry.id)}
                    >
                      <h2 className="text-xl font-semibold mr-2">
                        {entry.name}
                      </h2>
                    </div>
                    <div className="space-x-2 flex items-center flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditEntryModal(entry)}
                        className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                        title="Edit Entry"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {searchQuery
                  ? "No eboard members match your search."
                  : "No eboard members found. Add one to get started."}
              </p>
            )}
          </div>
        )}
  
        <EboardModal
          isOpen={showEboardModal}
          onClose={handleEboardCloseAttempt}
          onConfirm={
            selectedEntry ? handleEditEntrySubmit : handleAddEntrySubmit
          }
          isEditing={!!selectedEntry}
          eboardData={eboardFormData}
          onEboardDataChange={handleEboardDataChange}
        />

      </div>
    );
  };
  
  export default EboardManagement;
  