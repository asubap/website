import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SponsorDescription from "../../components/sponsor/SponsorDescription";
import axios from "axios";
import { useAuth } from "../../context/auth/authProvider";
import { MoreHorizontal, X, Pencil, Check } from "lucide-react";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Edit Profile Modal Component
interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsorName: string;
    sponsorDescription: string;
    onUpdate: (updatedProfile: { description: string; links: string[]; newProfilePic: File | null }) => void;
    token: string;
    profileUrl: string;
    onProfilePicChange: (url: string) => void;
    links?: string[];
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, sponsorName, sponsorDescription, onUpdate, token, profileUrl, onProfilePicChange, links = [] }) => {
    // State variables
    const [about, setAbout] = useState(sponsorDescription);
    const [linksList, setLinksList] = useState<string[]>(links);
    const [newLink, setNewLink] = useState("");
    const [editingLink, setEditingLink] = useState({ index: -1, value: "" });
    const [initialAbout, setInitialAbout] = useState(sponsorDescription);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [currentProfileUrl, setCurrentProfileUrl] = useState(profileUrl);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [linkToRemove, setLinkToRemove] = useState("");
    const [linkError, setLinkError] = useState("");
    const [showPicConfirmation, setShowPicConfirmation] = useState(false);
    const [showLinkWarning, setShowLinkWarning] = useState(false);
    
    // Use refs to reliably track changes 
    const hasChangesRef = useRef({
        about: false,
        links: false
    });
    
    // Check if there are unsaved changes
    const hasUnsavedChanges = () => {
        // Check links and bio directly
        const areLinksChanged = hasChangesRef.current.links;
        const isBioChanged = hasChangesRef.current.about;
        const hasNewProfilePic = profilePicFile !== null;
        const isEditingALink = editingLink.index !== -1;
        
        // Determine if there are any changes
        const hasChanges = areLinksChanged || isBioChanged || hasNewProfilePic || isEditingALink;
        
        console.log("hasUnsavedChanges check:", {
            areLinksChanged,
            isBioChanged,
            hasNewProfilePic,
            isEditingALink,
            hasChanges,
            refState: { ...hasChangesRef.current }
        });
        
        return hasChanges;
    };

    useEffect(() => {
        setAbout(sponsorDescription);
        setLinksList(links);
        setCurrentProfileUrl(profileUrl);
        setInitialAbout(sponsorDescription);
        // Reset file selection state when modal opens/closes
        setProfilePicFile(null);
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl); // Clean up previous preview
        }
        setPreviewImageUrl(null);
        
        // Reset change tracking when modal opens/closes
        hasChangesRef.current = {
            about: false,
            links: false
        };
    }, [sponsorDescription, links, profileUrl, isOpen]);

    const isValidUrl = (urlString: string) => {
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    };

    const handleAddLink = () => {
        if (!newLink.trim()) {
            setLinkError("Please enter a valid URL");
            return;
        }

        if (!isValidUrl(newLink)) {
            setLinkError("Please enter a valid URL starting with http:// or https://");
            return;
        }

        // Add link and set change state
        const newLinksList = [...linksList, newLink];
        setLinksList(newLinksList);
        hasChangesRef.current.links = true;
        
        console.log("Link added, changes set to true:", hasChangesRef.current);
        
        setNewLink("");
        setLinkError("");
    };

    const startEditLink = (index: number) => {
        console.log("Starting to edit link at index:", index);
        setEditingLink({ index, value: linksList[index] });
        // Just starting to edit is enough to mark as having unsaved changes
        hasChangesRef.current.links = true;
        console.log("Started editing link, changes set to true:", hasChangesRef.current);
    };

    const saveEditLink = () => {
        if (!isValidUrl(editingLink.value)) {
            setLinkError("Please enter a valid URL starting with http:// or https://");
            return;
        }

        // Edit link and set change state
        const newLinks = [...linksList];
        newLinks[editingLink.index] = editingLink.value;
        setLinksList(newLinks);
        hasChangesRef.current.links = true;
        
        setEditingLink({ index: -1, value: '' });
        setLinkError("");
    };

    const cancelEditLink = () => {
        setEditingLink({ index: -1, value: '' });
        setLinkError("");
    };

    const confirmRemoveLink = (linkToRemove: string, e?: React.MouseEvent) => {
        // Only stop propagation but not preventDefault
        if (e) {
            e.stopPropagation();
        }
        setLinkToRemove(linkToRemove);
        setShowConfirmation(true);
    };

    const handleRemoveLink = (e?: React.MouseEvent) => {
        console.log("Removing link:", linkToRemove);
        
        // Only stop propagation but not preventDefault
        if (e) {
            e.stopPropagation();
        }
        
        // Remove the link immediately and set change state
        const newLinksList = linksList.filter(link => link !== linkToRemove);
        setLinksList(newLinksList);
        hasChangesRef.current.links = true;
        
        // Close the confirmation dialog
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
        setLinkToRemove("");
    };

    // Reset state when modal closes
    const handleModalClose = () => {
        // Reset ref before closing
        hasChangesRef.current = {
            about: false,
            links: false
        };
        
        onClose();
        
        // Reset the state 100ms after the modal closes
        setTimeout(() => {
            setNewLink("");
            setEditingLink({ index: -1, value: "" });
            setLinkError("");
            setShowConfirmation(false);
            setShowPicConfirmation(false);
            // Ensure preview URL is revoked on close
            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl);
            }
            setPreviewImageUrl(null);
        }, 100);
    };

    const handleSave = async () => {
        // Check if there's text in the newLink input that hasn't been added
        if (newLink.trim()) {
            // Show warning instead of saving
            setShowLinkWarning(true);
            return;
        }
        
        onUpdate({
            description: about,
            links: linksList,
            newProfilePic: profilePicFile
        });
        
        // Reset change tracking after initiating save
        hasChangesRef.current = {
            about: false,
            links: false
        };
        
        handleModalClose();
    };

    const handleAddAndSave = () => {
        // Add the link first
        handleAddLink();
        // Then save after a small delay to ensure state is updated
        setTimeout(() => {
            onUpdate({
                description: about,
                links: [...linksList, newLink],
                newProfilePic: profilePicFile
            });
            
            // Reset change tracking
            hasChangesRef.current = {
                about: false,
                links: false
            };
            
            handleModalClose();
        }, 100);
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile || !token) return;
        
        setUploadingProfilePic(true);
        
        try {
            const formData = new FormData();
            formData.append('file', profilePicFile);
            
            const response = await fetch(`https://asubap-backend.vercel.app/sponsors/${sponsorName}/pfp`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setCurrentProfileUrl(data.photoUrl || data.url);
            onProfilePicChange(data.photoUrl || data.url);
            setProfilePicFile(null);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleProfilePicDelete = async () => {
        if (!token) {
            console.error("Cannot delete profile picture: No authentication token available");
            return;
        }
        
        console.log("Deleting profile picture...", {
            endpoint: `https://asubap-backend.vercel.app/sponsors/${sponsorName}/pfp`,
            method: 'DELETE'
        });
        
        try {
            // Use the API endpoint provided
            const response = await fetch(`https://asubap-backend.vercel.app/sponsors/${sponsorName}/pfp`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Get response text regardless of success/failure
            const responseText = await response.text();
            console.log(`Delete profile picture response: ${response.status}`, responseText || "(empty response body)");
            
            if (!response.ok) {
                throw new Error(`Failed to delete profile picture: ${response.status} ${responseText}`);
            }
            
            console.log("Profile picture deletion successful");
            
            // Set default image or placeholder
            const placeholderUrl = '/placeholder-logo.png';
            setCurrentProfileUrl(placeholderUrl);
            onProfilePicChange(placeholderUrl); // Update parent state via callback
            
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            // Add user feedback here if desired (toast notification, etc.)
            alert('Failed to delete profile picture. Please try again or contact support.');
        } finally {
            setShowPicConfirmation(false); // Close confirmation dialog regardless of outcome
        }
    };

    const confirmProfilePicDelete = () => {
        setShowPicConfirmation(true);
    };

    const cancelProfilePicDelete = () => {
        setShowPicConfirmation(false);
    };

    // Handle file selection: Create and set preview URL
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        
        // Revoke previous preview URL if it exists
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl);
            setPreviewImageUrl(null);
        }

        setProfilePicFile(file);

        if (file) {
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewImageUrl(newPreviewUrl);
            // Mark changes if a file is selected
            hasChangesRef.current.about = hasChangesRef.current.about || true; 
        } else {
            // Mark changes if file selection is cleared (might revert to original)
            hasChangesRef.current.about = hasChangesRef.current.about || (currentProfileUrl !== profileUrl);
        }
    };

    // Cancel the current file selection (clears preview)
    const cancelFileSelection = () => {
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl);
        }
        setProfilePicFile(null);
        setPreviewImageUrl(null);
        // Mark changes if selection is cancelled (might revert to original)
        hasChangesRef.current.about = hasChangesRef.current.about || (currentProfileUrl !== profileUrl);
    };

    // Cleanup effect for object URL
    useEffect(() => {
        // Return cleanup function to revoke URL on unmount
        return () => {
            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl);
            }
        };
    }, [previewImageUrl]); // Rerun only if previewImageUrl changes (should only run on unmount due to dependency)

    const modalContent = (
        <>
            {/* Profile Picture Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                <div className="flex items-start gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-white overflow-hidden shadow-sm">
                            <img 
                                src={previewImageUrl || currentProfileUrl}
                                alt={`${sponsorName} Logo Preview`} 
                                className="max-w-full max-h-full object-contain p-1" 
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <label 
                                htmlFor="profile-pic-upload" 
                                className="bg-bapred text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-80 transition-colors"
                                title="Change picture"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                  <path d="M12 5v14M5 12h14"></path>
                                </svg>
                            </label>
                        </div>
                        {previewImageUrl && (
                            <button 
                                onClick={cancelFileSelection}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-600 text-white w-5 h-5 rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Cancel selection"
                            >
                                <X size={12} />
                            </button>
                        )}
                        <input 
                            id="profile-pic-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <h4 className="text-xl font-bold">{sponsorName}</h4>
                        
                        {profilePicFile && (
                            <button 
                                onClick={handleProfilePicUpload}
                                disabled={uploadingProfilePic}
                                className="px-3 py-1 bg-bapred text-white rounded-md text-sm mt-2 w-fit hover:bg-opacity-80 transition-colors disabled:opacity-50"
                            >
                                {uploadingProfilePic ? 'Uploading...' : 'Upload New Picture'}
                            </button>
                        )}
                        
                        {!profilePicFile && (
                            <button 
                                onClick={confirmProfilePicDelete}
                                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm mt-2 w-fit hover:bg-gray-700 transition-colors"
                            >
                                Remove Picture
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Recommended size: 250x250px square image</p>
            </div>
            
            {/* Links Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newLink} 
                        onChange={e => {
                            setNewLink(e.target.value);
                            // Mark that we're making changes to links
                            if (e.target.value.trim()) {
                                hasChangesRef.current.links = true;
                            }
                        }}
                        placeholder="https://example.com"
                        className="flex-grow px-3 py-2 border rounded-md"
                    />
                    <button 
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-bapred text-white rounded-md font-bold"
                        title="Add link"
                    >
                        +
                    </button>
                </div>
                {linkError && <p className="text-red-500 text-sm mb-4">{linkError}</p>}
                
                {editingLink.index !== -1 && (
                    <div className="mb-4 p-3 border rounded-md bg-gray-50">
                        <h4 className="font-medium mb-2">Edit Link</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={editingLink.value} 
                                onChange={e => {
                                    setEditingLink({ ...editingLink, value: e.target.value });
                                    // Force change tracking for link edits
                                    hasChangesRef.current.links = true;
                                    console.log("Editing link value, changes set to true:", hasChangesRef.current);
                                }}
                                className="flex-grow px-3 py-2 border rounded-md"
                            />
                            <button 
                                onClick={saveEditLink}
                                className="px-3 py-2 bg-green-600 text-white rounded-md"
                                title="Save"
                            >
                                Save
                            </button>
                            <button 
                                onClick={cancelEditLink}
                                className="px-3 py-2 bg-gray-400 text-white rounded-md"
                                title="Cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                {linksList.length > 0 && (
                    <ul className="overflow-hidden">
                        {linksList.map((link, index) => (
                            <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                                <span className="text-black truncate max-w-[80%]">{link}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            startEditLink(index);
                                            // Mark as changed when editing a link
                                            hasChangesRef.current.links = true;
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                                        title="Edit"
                                    >
                                        <MoreHorizontal size={16} className="text-gray-600" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            confirmRemoveLink(link, e);
                                            // Mark as changed when removing a link
                                            hasChangesRef.current.links = true;
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                                        title="Remove"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* About Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <textarea 
                    value={about} 
                    onChange={e => {
                        const newValue = e.target.value;
                        setAbout(newValue);
                        
                        // Update ref directly - much more reliable than state
                        hasChangesRef.current.about = (newValue !== initialAbout);
                        
                        console.log("About text changed:", {
                            newValue,
                            initialAbout,
                            hasChanged: hasChangesRef.current.about
                        });
                    }}
                    onBlur={() => {
                        // Use ref directly on blur too
                        hasChangesRef.current.about = (about !== initialAbout);
                        console.log("Textarea blur - ref:", hasChangesRef.current);
                    }}
                    className="w-full px-3 py-2 border rounded-md min-h-[150px] focus:ring-bapred focus:border-bapred"
                    maxLength={500}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Company description (max 500 characters)</span>
                    <span>{about.length}/500</span>
                </div>
            </div>

            {/* Confirmation modals */}
            {showConfirmation && (
                <ConfirmDialog
                    isOpen={showConfirmation}
                    onClose={() => {
                        handleCancelRemove();
                    }}
                    onConfirm={(e) => {
                        handleRemoveLink(e);
                    }}
                    title="Confirm Removal"
                    message="Are you sure you want to remove this link?"
                    confirmText="Remove"
                    cancelText="Cancel"
                    preventOutsideClick={true}
                />
            )}

            {showPicConfirmation && (
                <ConfirmDialog
                    isOpen={showPicConfirmation}
                    onClose={() => {
                        cancelProfilePicDelete();
                    }}
                    onConfirm={() => {
                        handleProfilePicDelete();
                    }}
                    title="Confirm Deletion"
                    message="Are you sure you want to remove this profile picture?"
                    confirmText="Remove"
                    cancelText="Cancel"
                    preventOutsideClick={true}
                />
            )}
            
            {/* Link warning dialog */}
            {showLinkWarning && (
                <ConfirmDialog
                    isOpen={showLinkWarning}
                    onClose={() => {
                        setShowLinkWarning(false);
                        // Just save without the link
                        onUpdate({
                            description: about,
                            links: linksList,
                            newProfilePic: null
                        });
                        handleModalClose();
                    }}
                    onConfirm={() => {
                        handleAddAndSave();
                    }}
                    title="Unsaved Link"
                    message={`You have text in the link field that hasn't been added: "${newLink}". Would you like to add it before saving?`}
                    confirmText="Add & Save"
                    cancelText="Discard Link"
                    preventOutsideClick={true}
                />
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleModalClose}
            title="Edit Profile"
            hasUnsavedChanges={hasUnsavedChanges}
            onConfirm={handleSave}
            confirmText="Save Changes"
            cancelText="Cancel"
            showFooter={true}
            size="lg"
        >
            {modalContent}
        </Modal>
    );
};


const SponsorHome = () => {
    const { session } = useAuth();
    const token = session?.access_token;

    const navLinks = [
        { name: "Network", href: "/network" },
        { name: "Events", href: "/events" },
        { name: "Dashboard", href: "/sponsor" },
      ];

    const [sponsorData, setSponsorData] = useState<{
        name: string;
        description: string;
        profileUrl: string;
        links: string[];
    }>({
        name: "",
        description: "",
        profileUrl: "",
        links: []
    });
    const [loadingSponsor, setLoadingSponsor] = useState(true);
    const [sponsorError, setSponsorError] = useState<string | null>(null);
    const [resources, setResources] = useState<{id?: number, label: string, url: string, uploadDate?: string}[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [resourceName, setResourceName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [previewResource, setPreviewResource] = useState<{id?: number, label: string, url: string, name?: string} | null>(null);
    const [loadingResources, setLoadingResources] = useState(true);
    
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<{id?: number, label: string, url: string} | null>(null);

    // Helper function to format dates properly
    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Recent upload" : date.toLocaleDateString();
    };

    // Reset zoom level when opening a new preview
    useEffect(() => {
        if (previewResource) {
           // No zoom state to reset
        }
    }, [previewResource]);

    // Fetch sponsor data from backend - using passcode endpoint
    const fetchSponsorData = async () => {
        setLoadingSponsor(true);
        setSponsorError(null);
        // const sponsorName = "Deloitte"; // No longer needed
        const passcode = "1324"; // Passcode for the endpoint
        
        try {
            // Fetch dynamic data using the passcode endpoint
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sponsors/get-sponsor-info`, 
                { passcode: passcode }, // Request body
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add Authorization header if this endpoint requires it
                        // Authorization: `Bearer ${token}` 
                    }
                }
            );
            
            const data = response.data;
            
            // Assuming the response includes company_name, description, pfp_url, links
            setSponsorData({
                name: data.company_name || "Sponsor Name Missing", // Use fetched name
                description: data.about || data.description || "No description provided.", // Check for 'about' or 'description'
                profileUrl: data.pfp_url || data.profileUrl || "/placeholder-logo.png", // Check for 'pfp_url' or 'profileUrl'
                links: data.links || []
            });
            
        } catch (error) {
            console.error(`Error fetching sponsor data with passcode:`, error);
            let errorMessage = "Could not retrieve sponsor information. Please try again later.";
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                errorMessage = "Invalid passcode provided for fetching sponsor data.";
            } else if (axios.isAxiosError(error) && error.response) {
                errorMessage = `Error fetching sponsor data: ${error.response.status} ${error.response.statusText}`;
            } else if (error instanceof Error) {
                 errorMessage = `Error fetching sponsor data: ${error.message}`;
            }
            setSponsorError(errorMessage);
            
            // Set fallback data 
            setSponsorData({
                name: "Error", // Indicate error in name
                description: "Information unavailable.",
                profileUrl: "/placeholder-logo.png",
                links: []
            });
        } finally {
            setLoadingSponsor(false);
        }
    };

    // Reload sponsor data
    const reloadSponsorData = () => {
        if (token) {
            fetchSponsorData();
        }
    };

    useEffect(() => {
        // Fetch data when component mounts and when token changes
        if (token) {
            fetchSponsorData();
        }
    }, [token]);

    // Separate effect for fetching resources once sponsor data is available
    useEffect(() => {
        if (token && sponsorData.name) {
            fetchResources();
        }
    }, [token, sponsorData.name]);

    const fetchResources = async () => {
        if (!sponsorData.name) {
            console.log("Skipping resource fetch - sponsor name not available yet");
            setLoadingResources(false);
            return;
        }
        
        setLoadingResources(true);
        try {
            // Use the correct API endpoint with environment variable and proper slash
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorData.name}/resources`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Ensure resources is an array
            const resourcesData = Array.isArray(response.data) ? response.data : 
                                 (response.data?.resources || response.data?.data || []);
            setResources(resourcesData);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoadingResources(false);
        }
    };

    const handleResourceUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !resourceName || !token) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resourceLabel', resourceName);
            formData.append('file', file);
            
            console.log("Uploading resource with key 'file'");

            // Use the correct API endpoint with environment variable
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorData.name}/resources`, formData, {
                headers: {
                    // Do not set Content-Type, axios will set it automatically with proper boundary
                    'Authorization': `Bearer ${token}`
                }
            });

            setFile(null);
            setResourceName("");
            fetchResources(); // Refresh the resources list
        } catch (error) {
            console.error('Error uploading resource:', error);
        } finally {
            setUploading(false);
        }
    };

    const uploadProfilePicture = async (file: File): Promise<string | null> => {
        if (!token) return null;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`https://asubap-backend.vercel.app/sponsors/${sponsorData.name}/pfp`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.photoUrl || data.url;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert(error instanceof Error ? error.message : 'Upload failed');
            return null;
        }
    };

    const handleProfileUpdate = async (updatedProfile: { description: string; links: string[]; newProfilePic: File | null }) => {
        let newProfileUrl = sponsorData.profileUrl; // Start with current URL
        const passcode = "1324"; // Use the same passcode used for fetching sponsor data

        // 1. Upload new profile picture if provided
        if (updatedProfile.newProfilePic) {
            const uploadedUrl = await uploadProfilePicture(updatedProfile.newProfilePic);
            if (uploadedUrl) {
                newProfileUrl = uploadedUrl; // Update URL if upload succeeded
            } else {
                console.error("Profile picture upload failed. Profile data not updated.");
                alert('Failed to upload profile picture. Please try again.');
                return; // Stop the update process if PFP upload fails
            }
        }

        // 2. Update other profile data (description, links)
        try {
            console.log("Updating sponsor details...");
            
            // Format the request body to match exactly what the API expects
            // Links should be an empty string when empty or joined with commas if there are links
            const linksForApi = Array.isArray(updatedProfile.links) && updatedProfile.links.length > 0 
                ? updatedProfile.links.join(',') 
                : "";
            
            const requestBody = {
                passcode: passcode,
                about: updatedProfile.description,
                links: linksForApi
            };
            
            console.log("Sending update with body:", requestBody);
            
            // Make the API call to update sponsor details
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/sponsors/details`, 
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log("Sponsor details updated successfully:", response.data);
            
            // Update local state on success
            setSponsorData(prevData => ({
                ...prevData,
                description: updatedProfile.description,
                links: updatedProfile.links,
                profileUrl: newProfileUrl
            }));
            
        } catch (error) {
            console.error('Error updating sponsor details:', error);
            alert('Failed to update sponsor details. Please try again.');
            
            // Optional: Still update profile picture in local state since that was successful
            if (newProfileUrl !== sponsorData.profileUrl) {
                setSponsorData(prevData => ({
                    ...prevData,
                    profileUrl: newProfileUrl
                }));
            }
        }
    };

    const handleResourceDelete = async (resource: {id?: number, label: string, url: string}) => {
        console.log("handleResourceDelete called for resource URL:", resource.url);
        
        if (!token || !resource.url) {
            console.error('Cannot delete resource: missing token or resource URL');
            return;
        }
        
        try {
            console.log(`Attempting to delete resource with URL: ${resource.url}`);
            // Use the endpoint DELETE /sponsors/:companyName/resources
            // Send resourceUrl in the request body
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/sponsors/${sponsorData.name}/resources`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Important for sending data in body
                },
                data: { // Use 'data' key for request body in axios.delete
                    resourceUrl: resource.url 
                }
            });
            console.log(`Successfully sent delete request for resource URL: ${resource.url}`);
            // Refresh resource list after deletion
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert(`Failed to delete resource: ${resource.label}. Please try again.`);
        }
    };
    
    // Function to trigger delete confirmation
    const confirmResourceDelete = (resource: {id?: number, label: string, url: string}) => {
        setResourceToDelete(resource);
        setShowDeleteConfirmation(true);
    };
    
    // Function to execute deletion after confirmation
    const executeDelete = () => {
        if (resourceToDelete) {
            handleResourceDelete(resourceToDelete);
        }
        setShowDeleteConfirmation(false);
        setResourceToDelete(null);
    };
    
    // Function to cancel deletion
    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setResourceToDelete(null);
    };

    // Function to handle showing resource preview
    const showResourcePreview = (resource: {id?: number, label: string, url: string}) => {
        setPreviewResource(resource);
    };

    // Function to close the preview modal
    const closePreview = () => {
        setPreviewResource(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                    isLogged={true}
                    links={navLinks}
                    title="Beta Alpha Psi | Beta Tau Chapter"
                    backgroundColor="#FFFFFF"
                    outlineColor="#AF272F"
                />

            {/* Add padding-top to account for fixed navbar */}
            <div className="flex flex-col pt-[72px] flex-grow">
                <main className="flex-grow flex flex-col items-center justify-center py-24">
                    {loadingSponsor ? (
                        // Use navbar padding for alignment
                        <div className="w-full px-8 sm:px-16 lg:px-24">
                            <LoadingSpinner text="Loading sponsor information..." size="lg" />
                        </div>
                    ) : sponsorError ? (
                         // Use navbar padding for alignment
                        <div className="w-full px-8 sm:px-16 lg:px-24">
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <p className="font-bold">Error Loading Data</p>
                                <p className="block sm:inline">{sponsorError}</p>
                                <button 
                                    onClick={reloadSponsorData}
                                    className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : (
                    // Apply the user-specified grid, gap, and padding classes
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-4 md:px-32">
                        <div className="flex flex-col items-center justify-start h-full gap-8 w-full">
                            <div className="w-full">   
                                <h1 className="text-4xl font-bold font-outfit">
                                    Welcome back, <span className="text-bapred">{sponsorData.name}</span>!
                                </h1>
                            </div>
                            <SponsorDescription 
                                profileUrl={sponsorData.profileUrl} 
                                name={sponsorData.name} 
                                description={sponsorData.description} 
                                links={sponsorData.links}
                                onEditClick={() => setIsEditModalOpen(true)}
                            />
                        </div>
                        
                        {/* Resource Management */}
                        <div className="h-full w-full">
                            <div className="flex flex-col gap-8 h-full">
                                <div className="border p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-bold mb-4">Upload Resources</h2>
                                    <form onSubmit={handleResourceUpload} className="flex flex-col gap-4">
                                        <div>
                                            <label className="block mb-1 font-medium">Resource Name</label>
                                            <input 
                                                type="text" 
                                                value={resourceName} 
                                                onChange={e => setResourceName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium">File</label>
                                            <input 
                                                type="file"
                                                onChange={e => setFile(e.target.files?.[0] || null)}
                                                className="w-full"
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!file || !resourceName || uploading}
                                            className="px-4 py-2 bg-bapred text-white rounded disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Resource'}
                                        </button>
                                    </form>
                                </div>
                                
                                <div className="border p-6 rounded-lg shadow-md">
                                    <h2 className="text-2xl font-bold mb-4">My Resources</h2>
                                    {loadingResources ? (
                                        <LoadingSpinner text="Loading resources..." />
                                    ) : Array.isArray(resources) && resources.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {resources.map(resource => (
                                                <div key={resource.id || resource.url} className="flex justify-between items-center border-b pb-2">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <p className="font-medium">{resource.label}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500">Uploaded on {formatDate(resource.uploadDate || '')}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => showResourcePreview(resource)}
                                                            className="px-3 py-1 bg-bapred text-white rounded text-sm"
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                console.log("Delete button clicked for resource:", resource);
                                                                if (resource.url) {
                                                                    confirmResourceDelete(resource); // Trigger confirmation
                                                                } else {
                                                                    console.log("Resource URL is missing, cannot delete");
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
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
                            </div>
                        </div>
                    </div>
                    )}
                </main>
            </div>
            
            <Footer backgroundColor="#AF272F" />

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                sponsorName={sponsorData.name}
                sponsorDescription={sponsorData.description}
                onUpdate={handleProfileUpdate}
                token={session?.access_token || ""}
                profileUrl={sponsorData.profileUrl}
                onProfilePicChange={(url) => setSponsorData(prevData => ({ ...prevData, profileUrl: url }))}
                links={sponsorData.links}
            />

            {/* Resource Preview Modal */}
            {previewResource && (() => { // Use IIFE to calculate variable within JSX scope
                const isPreviewable = previewResource.url.endsWith('.pdf') || 
                                      previewResource.url.match(/\.(jpe?g|png|gif|svg|webp)$/i);
                
                return (
                    <Modal
                        isOpen={!!previewResource}
                        onClose={closePreview}
                        title={previewResource.label}
                        showFooter={true}
                        confirmText="Close"
                        onConfirm={closePreview}
                        size="lg"
                    >
                        <div className="w-full h-[70vh] flex flex-col items-center">
                             {/* Header row for Open in New Tab / Download button */}
                             <div className="w-full mb-4 flex justify-end items-center">
                                <a 
                                    href={previewResource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-bapred text-white rounded text-sm"
                                    {...(!isPreviewable && { download: previewResource.label || 'download' })} // Add download attribute conditionally
                                >
                                    {isPreviewable ? 'Open in New Tab' : 'Download'} {/* Conditional text */}
                                </a>
                            </div>
                            
                            {/* Scrollable container for preview content */}
                            <div 
                                className="w-full flex-1 overflow-auto border border-gray-200 bg-gray-50"
                                style={{ maxHeight: 'calc(70vh - 60px)' }} // Adjust height based on controls row height
                            >
                                {isPreviewable ? (
                                    previewResource.url.endsWith('.pdf') ? (
                                        // PDF container
                                        <div 
                                            className="w-full h-full flex justify-center"
                                            style={{ minHeight: '100%' }} // Ensure PDF takes full height
                                        >
                                            <iframe 
                                                src={`${previewResource.url}#toolbar=0`} 
                                                className="w-full h-full border-none shadow-md"
                                                title={previewResource.label}
                                                loading="eager"
                                            />
                                        </div>
                                    ) : (
                                        // Image container
                                        <div 
                                            className="w-full h-full flex items-center justify-center p-4"
                                        >
                                            <img 
                                                src={previewResource.url} 
                                                alt={previewResource.label} 
                                                style={{ 
                                                    maxWidth: '100%', // Respect container width initially
                                                    maxHeight: '100%', // Respect container height initially
                                                    width: 'auto', 
                                                    height: 'auto',
                                                    display: 'block' // Helps with centering/sizing
                                                }}
                                                className="block shadow-md"
                                                loading="eager"
                                            />
                                        </div>
                                    )
                                ) : (
                                    // Message for non-previewable files
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <p className="mb-4">This file type cannot be previewed in-browser.</p>
                                        <p className="text-sm text-gray-500">Click the 'Download' button above to save the file.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal>
                );
            })()}

            {/* Delete Resource Confirmation Dialog */}
            {showDeleteConfirmation && resourceToDelete && (
                <ConfirmDialog
                    isOpen={showDeleteConfirmation}
                    onClose={cancelDelete}
                    onConfirm={executeDelete}
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the resource: "${resourceToDelete.label}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    preventOutsideClick={true}
                />
            )}
        </div>
    );
};

export default SponsorHome;