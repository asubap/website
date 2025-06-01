import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {MoreHorizontal, Trash2} from "lucide-react";
import { useAuth } from "../../context/auth/authProvider";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import EboardModal from "./EboardModal";
import Fuse from "fuse.js";
import SearchInput from "../common/SearchInput";
import ConfirmationModal from "../common/ConfirmationModal";

type EboardFacultyEntry = {
  id: string;
  name: string;
  rank: number;
  role: string;
  email: string;
  memberEmail: string;
  major: string;
  location: string;
};

const EboardManagement: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<EboardFacultyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<EboardFacultyEntry | null>(null);
  const [showEboardModal, setShowEboardModal] = useState(false);
  const [members, setMembers] = useState<{ email: string; name?: string }[]>([]);
  const initialEntryStateRef = useRef({
    name: "",
    rank: 1,
    role: "",
    email: "",
    memberEmail: "",
    major: "",
    location: "",
  });
  const [eboardFormData, setEboardFormData] = useState<EboardFacultyEntry>({
    id: "",
    name: "",
    rank: 1,
    role: "",
    email: "",
    memberEmail: "",
    major: "",
    location: "",
  });
  const [showConfirmEboardClose, setShowConfirmEboardClose] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);


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

      // Map backend fields to frontend model
      const entriesWithIds = data.map((entry: any) => ({
        id: entry.id || crypto.randomUUID(),
        role: entry.role,
        rank: entry.rank || 1,
        email: entry.role_email,      // Role Email
        memberEmail: entry.email,     // Member Email
        name: entry.name,
        major: entry.major,
        location: entry.location,
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
      name: "",
      rank: 1,
      role: "",
      email: "",
      memberEmail: "",
      major: "",
      location: "",
    };
    setEboardFormData(initialState);
    initialEntryStateRef.current = { ...initialState };
    setShowEboardModal(true);
  };

  const handleOpenEditEntryModal = (entry: EboardFacultyEntry) => {
    setSelectedEntry(entry);
    setEboardFormData(entry);
    setShowEboardModal(true);
  };

  const handleEboardDataChange = (field: keyof EboardFacultyEntry, value: string | number) => {
    setEboardFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEntrySubmit = async () => {
    if (!session?.access_token) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/eboard/add-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            role: eboardFormData.role,
            role_email: eboardFormData.email,
            email: eboardFormData.memberEmail,
            rank: eboardFormData.rank,
          }),
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
        `${import.meta.env.VITE_BACKEND_URL}/eboard/edit-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            role_email: selectedEntry.email,
            role: eboardFormData.role,
            email: eboardFormData.memberEmail,
            rank: eboardFormData.rank,
          }),
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

  const handleDeleteEntry = (email: string) => {
    setMemberToDelete(email);
    setShowDeleteModal(true);
  };

  const confirmDeleteEntry = async () => {
    if (!session?.access_token || !memberToDelete) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/eboard/delete-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            role_email: memberToDelete,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete eboard member");
      }
      toast.success("Eboard member deleted successfully");
      fetchResources();
    } catch (error) {
      console.error("Error deleting eboard member:", error);
      toast.error("Failed to delete eboard member");
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const hasEboardChanges = () => {
      return (
        JSON.stringify(eboardFormData) !==
        JSON.stringify(initialEntryStateRef.current)
      );
    };

  const handleEboardCloseAttempt = () => {
      if (hasEboardChanges()) {
          console.log(showConfirmEboardClose)
          setShowConfirmEboardClose(true);
      } else {
      closeAndResetEboardModal();
      }
  };

  const closeAndResetEboardModal = () => {
      setShowEboardModal(false);
      setSelectedEntry(null);
    };

  // Add fetchMembers function
  const fetchMembers = useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      const fetchedMembers = data
        .filter((item: any) => item.role === "general-member")
        .map((item: any) => ({ email: item.email, name: item.name }));

      // Sort members by name
      fetchedMembers.sort((a: { email: string; name?: string }, b: { email: string; name?: string }) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      setMembers(fetchedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading) {
      fetchMembers();
    }
  }, [authLoading, fetchMembers]);

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
                      onClick={() => handleDeleteEntry(entry.email)}
                      className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100"
                      title="Delete Entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-bapgray">
                  <div>Rank: {entry.rank}</div>
                  <div>Role: {entry.role}</div>
                  <div>Role Email: {entry.email}</div>
                  <div>Member Email: {entry.memberEmail}</div>
                  <div>Major: {entry.major}</div>
                  {entry.location && <div>Location: {entry.location}</div>}
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
        hideImageField={true}
        members={members}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDeleteEntry}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  );
};

export default EboardManagement;
  